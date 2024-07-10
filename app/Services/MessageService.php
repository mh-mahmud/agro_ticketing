<?php


namespace App\Services;


use App\Helpers\Helper;
use App\Models\Message;
use App\Repositories\MessageRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class MessageService
{
    protected $repository;

    public function __construct(MessageRepository $repository)
    {

        $this->repository             = $repository;

    }

    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            $collections              = $this->repository->listing($request);

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'             => 424,
                'messages'           => config('status.status_code.424'),
                'error'              => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200'),
            'collections'           => $collections
        ]);
    }

    public function showItem($id)
    {

        DB::beginTransaction();

        try{

            $info                   = $this->repository->show($id);

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'message'               => config('status.status_code.200'),
            'info'                  => $info
        ]);
    }

    public function filesValidate($requestFiles){
        
        $allow_mime_type = config('others.ALLOW_MIME_TYPE');
        $error = false;
        foreach($requestFiles as $file){
            if(!in_array($file->getMimeType(), $allow_mime_type)){
                $error[] = $file->getClientOriginalName();
            }
        }
        return $error;

    }

    public function createItem($request)
    {
        $data                      = $request->all();
        $data['id']                 = Helper::idGenarator();
        // $data['slug']              = Helper::slugify($request->name);

        DB::beginTransaction();

        try {

            if( isset($request->files) && $error = $this->filesValidate($request->files)){
                throw new Exception("The file is not allowed : " . implode(', ', $error));
            }

            $this->repository->create($data);
            $message = Message::find($data['id']);
            if( isset($request->files) ) {
                // foreach($request->files as $files){
                    foreach($request->files as $file){
                        
                        $filePath           = Helper::fileUpload("media/ticket", $file);
        
                        $message->media()->create([
        
                            'url'           => $filePath
        
                        ]);
                    }
                // }
            }

        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code'       => 424,
                'messages'          => config('status.status_code.424'),
                'errors'            => [$e->getMessage()]
            ]);
        }

        DB::commit();

        return response()->json([
            'status_code'           => 201,
            'messages'              => config('status.status_code.201'),
            //'info'                  => $info
        ]);
    }

    public function updateItem($request,$id)
    {
        $validator = Validator::make($request->all(),[
            'ticket_id'               => 'required',
            'message'            => 'required',
           
        ],[
            'ticket_id.required'     => 'Ticket required',
            'message.required'   => 'Message required',
        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }

        $data                      = $request->all();

        DB::beginTransaction();

        try {

            $previousMsg = Message::findOrFail($id);
            $this->repository->update($data, $id);
            
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'messages',
                'operated_row_id'   => $previousMsg->id,
                'previous_data'     => json_encode($previousMsg)
            ]);

            $info                   = $this->repository->show($id);


        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code'       => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status_code'           => 200,
            'messages'              => config('status.status_code.200'),
            'info'                  => $info
        ]);

    }


    public function deleteItem($id)
    {
        DB::beginTransaction();

        try {

            $previousMsg = Message::findOrFail($id);
            $this->repository->delete($id);
            
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'messages',
                'operated_row_id'   => $previousMsg->id,
                'previous_data'     => json_encode($previousMsg)
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code' => 424,
                'messages'=>config('status.status_code.424'),
                'error' => $e->getMessage()]);
        }

        DB::commit();

        return response()->json([
            'status_code' => 200,
            'messages'=>config('status.status_code.200')
        ]);
    }

}
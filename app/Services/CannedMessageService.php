<?php
namespace App\Services;

use App\Helpers\Helper;
use App\Models\CannedMessage;
use App\Repositories\CannedMessageRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CannedMessageService
{
    protected $repository;

    public function __construct(CannedMessageRepository $repository)
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

    public function createItem($request)
    {

        $validator = Validator::make($request->all(),[

            'title'                  => 'required|string|min:3|max:200|unique:canned_messages',
            'description'            => 'required',

        ],[
            'title.required'         => 'Canned Message Title required',
            'title.string'           => 'Canned Message Title must be string',
            'title.min'              => 'Canned Message Title minimum length 3',
            'title.max'              => 'Canned Message Title maximum length 200',
            'title.unique'           => 'Canned Message Title already taken',
            'description.required'   => 'Canned Message Description required',
        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }


        $data                      = $request->all();
        $data['slug']              = Helper::slugify($request->title);

        DB::beginTransaction();

        try {

            $cannedMsg = $this->repository->create($data);

            Helper::storeLog([
                'action'            => 'insert',
                'operated_table'    => 'canned_messages',
                'operated_row_id'   => $cannedMsg->id
            ]);

            $info                   = $this->repository->show($id = '');

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
            'status_code'           => 201,
            'messages'              => config('status.status_code.201'),
            'info'                  => $info
        ]);
    }



    public function updateItem($request,$id)
    {

        $error = [];
      
        if(DB::table('canned_messages')->select('title')->where('title','=',$request->title)->where('id','!=',$id)->first()){
           
            $error[] = 'Canned Message Title already taken';
			
        }
        $validator = Validator::make($request->all(),[
            'title'                  => "required|string|min:3|max:200",
            //'description'            => 'required',
        ],[
            'title.required'         => 'Canned Message Title required',
            'title.string'           => 'Canned Message Title must be string',
            'title.min'              => 'Canned Message Title minimum length 3',
            'title.max'              => 'Canned Message Title maximum length 200',
          
            //'description.required'   => 'Canned Message Description required',
        ]);

        if($validator->fails()|| count($error)) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => array_merge($error, $validator->errors()->all())
            ]);

        }

        $data                      = $request->all();
        // $data['slug']              = Helper::slugify($data['title']);
        if (isset($data['title'])){
            $data['slug']           = Helper::slugify($data['title']);
        }


        DB::beginTransaction();

        try {

            $cannedMsg = CannedMessage::findOrFail($id);
            $this->repository->update($data, $id);

            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'canned_messages',
                'operated_row_id'   => $cannedMsg->id,
                'previous_data'     => json_encode($cannedMsg)
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

            $cannedMsg = CannedMessage::findOrFail($id);
            $this->repository->delete($id);
            
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'canned_messages',
                'operated_row_id'   => $cannedMsg->id,
                'previous_data'     => json_encode($cannedMsg)
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
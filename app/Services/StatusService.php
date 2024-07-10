<?php

namespace App\Services;

use App\Helpers\Helper;
use App\Models\Status;
use App\Repositories\StatusRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class StatusService
{
    protected $repository;

    public function __construct(StatusRepository $repository)
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

            'name'                  => 'required|string|min:3|max:20|unique:statuses',

        ],[
            'name.required'         => 'Status name required',
            'name.string'           => 'Status name must be string',
            'name.min'              => 'Status name minimum length 3',
            'name.max'              => 'Status name maximum length 20',
            'name.unique'           => 'Status name already taken',
        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }

        $input                      = $request->all();
        $input['slug']              = Helper::slugify($input['name']);

        DB::beginTransaction();

        try {

            $id =$this->repository->create($input);
            Helper::storeLog([
                'action'            =>'insert',
                'operated_table'    =>'statuses',
                'operated_row_id'   =>$id
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
            'messages'              => config('status.status_code.200'),
            'info'                  => $info
        ]);
    }


    public function updateItem($request,$id)
    {
        $error = [];
      
        if(DB::table('statuses')->select('name')->where('name','=',$request->name)->where('id','!=',$id)->first()){
           
            $error[] = 'Status name already taken';
			
        }
        $validator = Validator::make($request->all(),[
		   
			'name'                  => "required|string|min:3|max:20",
			 
        ],[
            'name.required'         => 'Status name required',
            'name.string'           => 'Status name must be string',
            'name.min'              => 'Status name minimum length 3',
            'name.max'              => 'Status name maximum length 20',
            
        ]);
		

        if($validator->fails() || count($error)) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => array_merge($error, $validator->errors()->all())
            ]);

        }

        $input                      = $request->all();
        $input['slug']              = Helper::slugify($input['name']);


        DB::beginTransaction();

        try {
            $statusLog = Status::findOrFail($id);
            $this->repository->update($input, $id);
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'statuses',
                'operated_row_id'   => $statusLog->id,
                'previous_data'     => json_encode($statusLog)
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

    // public function updateItem($request,$id)
    // {
    //     $validator = Validator::make($request->all(),[
    //         'name'                  => "required|string|min:3|max:20|unique:statuses,name,$request->id,id"
    //     ],[
    //         'name.required'         => 'Status name required',
    //         'name.string'           => 'Status name must be string',
    //         'name.min'              => 'Status name minimum length 3',
    //         'name.max'              => 'Status name maximum length 20',
    //         'name.unique'           => 'Status name already taken',
    //     ]);
    //     //DB::table('statuses')->where('statuses.name', $request->name)->first();
    //     if($validator->fails()) {

    //         return response()->json([
    //             'status_code'       => 400,
    //             'messages'          => config('status.status_code.400'),
    //             'errors'            => $validator->errors()->all()
    //         ]);

    //     }

    //     $input                      = $request->all();
    //     $input['slug']              = Helper::slugify($input['name']);


    //     DB::beginTransaction();

    //     try {
    //         $statusLog = Status::findOrFail($id);
    //         $this->repository->update($input, $id);
    //         Helper::storeLog([
    //             'action'            => 'update',
    //             'operated_table'    => 'statuses',
    //             'operated_row_id'   => $statusLog->id,
    //             'previous_data'     => json_encode($statusLog)
    //         ]);
    //         $info                   = $this->repository->show($id);


    //     } catch (Exception $e) {

    //         DB::rollBack();
    //         Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

    //         return response()->json([
    //             'status_code'       => 424,
    //             'messages'          => config('status.status_code.424'),
    //             'error'             => $e->getMessage()
    //         ]);
    //     }

    //     DB::commit();

    //     return response()->json([
    //         'status_code'           => 200,
    //         'messages'              => config('status.status_code.200'),
    //         'info'                  => $info
    //     ]);

    // }



    public function deleteItem($id)
    {
        $shouldNotDelete = [
            /* These slugs are hardcoded for SLA part to frontend */
            'open', 'pending', 'resolved', 'closed'
        ];
        
        DB::beginTransaction();

        try {

            $status_exists = count(DB::table('tickets')->select('status_id')->where('status_id','=',$id)->get());

            if (!empty($status_exists)){
                return response()->json([
                    'status_code'   => 620,
                    'messages'      => config('status.status_code.620'),
                    'errors'        => [
                        "{$status_exists} Tickets are using this status"
                    ]
                ]);
            }
            
            $statusLog = Status::findOrFail($id);
            if( in_array($statusLog->slug, $shouldNotDelete) ){
                return response()->json([
                    'status_code'   => 620,
                    'messages'      => config('status.status_code.620'),
                    'errors'        => [
                        "You cannot delete this status."
                    ]
                ]);
            }

            $this->repository->delete($id);
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'statuses',
                'operated_row_id'   => $statusLog->id,
                'previous_data'     => json_encode($statusLog)
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
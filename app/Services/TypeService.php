<?php


namespace App\Services;


use App\Helpers\Helper;
use App\Models\Type;
use App\Repositories\TypeRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TypeService
{
    protected $repository;

    public function __construct(TypeRepository $repository)
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

    public function getAllTypes($request)
    {

        DB::beginTransaction();

        try{

            $collections              = $this->repository->getAllTypes($request);

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

            'name'                  => 'required|string|min:3|max:100|unique:types',
            'day'                   => 'numeric|min:0',
            'hour'                  => 'numeric|min:0|max:23',
            'min'                   => 'numeric|min:0|max:59'

        ],[
            'name.required'         => 'Type Name required',
            'name.string'           => 'Type Name must be string',
            'name.min'              => 'Type Name minimum length 3',
            'name.max'              => 'Type Name maximum length 100',
            'name.unique'           => 'Type Name already taken',
            
        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }


        $data                      = $request->all();
        $data['slug']              = Helper::slugify($request->name);

        DB::beginTransaction();

        try {

            $id = $this->repository->create($data);
            Helper::storeLog([
                'action'            =>'insert',
                'operated_table'    =>'types',
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
            'messages'              => config('status.status_code.201'),
            'info'                  => $info
        ]);
    }

    public function updateItem($request,$id)
    {   $error = [];
      
        if(DB::table('types')->select('name')->where('name','=',$request->name)->where('id','!=',$id)->first()){
           
            $error[] = 'Type Name already taken';
			
        }
        $validator = Validator::make($request->all(),[

            'name'                  => "required|string|min:3|max:100",
            'day'                   => 'numeric|min:0',
            'hour'                  => 'numeric|min:0|max:23',
            'min'                   => 'numeric|min:0|max:59'
           
        ],[
            
            'name.required'         => 'Type Name required',
            'name.string'           => 'Type Name must be string',
            'name.min'              => 'Type Name minimum length 3',
            'name.max'              => 'Type Name maximum length 100',
           
        ]);

        if($validator->fails() || count($error)) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => array_merge($error, $validator->errors()->all())
            ]);

        }

        $data                      = $request->all();
        // $data['slug']              = Helper::slugify($data['title']);
        if (isset($data['name'])){
            $data['slug']           = Helper::slugify($data['name']);
        }


        DB::beginTransaction();

        try {

            $typeLog = Type::findOrFail($id);
            $this->repository->update($data, $id);
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'types',
                'operated_row_id'   => $typeLog->id,
                'previous_data'     => json_encode($typeLog)
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
            
            $type_exists = count(DB::table('tickets')->select('type_id')->where('type_id','=',$id)->get());

            if (!empty($type_exists)){
                return response()->json([
                    'status_code'   => 620,
                    'messages'      => config('status.status_code.620'),
                    'errors'        => [
                        "{$type_exists} Tickets are using this type"
                    ]
                ]);
            }

            $typeLog = Type::findOrFail($id);

            $this->repository->delete($id);
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'types',
                'operated_row_id'   => $typeLog->id,
                'previous_data'     => json_encode($typeLog)
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
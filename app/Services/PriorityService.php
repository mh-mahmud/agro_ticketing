<?php


namespace App\Services;


use App\Helpers\Helper;
use App\Models\Priority;
use App\Repositories\PriorityRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PriorityService
{
    protected $repository;

    public function __construct(PriorityRepository $repository)
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

            'name'                  => 'required|string|min:3|max:20|unique:priorities',

        ],[
            'name.required'         => 'Priority name required',
            'name.string'           => 'Priority name must be string',
            'name.min'              => 'Priority name minimum length 3',
            'name.max'              => 'Priority name maximum length 20',
            'name.unique'           => 'Priority name already taken',
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

            $priority = $this->repository->create($input);
            
            Helper::storeLog([
                'action'            => 'insert',
                'operated_table'    => 'priorities',
                'operated_row_id'   => $priority->id
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
      
        if(DB::table('priorities')->select('name')->where('name','=',$request->name)->where('id','!=',$id)->first()){
           
            $error[] = 'Priority name already taken';
			
        }
        $validator = Validator::make($request->all(),[
            'name'                  => "required|string|min:3|max:20",
        ],[
            'name.required'         => 'Priority name required',
            'name.string'           => 'Priority name must be string',
            'name.min'              => 'Priority name minimum length 3',
            'name.max'              => 'Priority name maximum length 20',
           
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

            $priority = Priority::findOrFail($id);
            $this->repository->update($input, $id);
            
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'priorities',
                'operated_row_id'   => $priority->id,
                'previous_data'     => json_encode($priority)
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

            $priority_exists = count(DB::table('tickets')->select('priority_id')->where('priority_id','=',$id)->get());

            if (!empty($priority_exists)){
                return response()->json([
                    'status_code'   => 620,
                    'messages'      => config('status.status_code.620'),
                    'errors'        => [
//                        config('status.status_code.620')
                        "{$priority_exists} Tickets are using this priority"
                    ]
                ]);
            }

            $priority = Priority::findOrFail($id);
            $this->repository->delete($id);
            
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'priorities',
                'operated_row_id'   => $priority->id,
                'previous_data'     => json_encode($priority)
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
<?php


namespace App\Services;


use App\Helpers\Helper;
use App\Models\Source;
use App\Repositories\SourceRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SourceService
{
    protected $repository;

    public function __construct(SourceRepository $repository)
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
                'status'              => 424,
                'messages'            => config('status.status_code.424'),
                'error'               => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                 => 200,
            'messages'               => config('status.status_code.200'),
            'collections'            => $collections
        ]);
    }

    public function showItem($id)
    {

        DB::beginTransaction();

        try{

            $info                    = $this->repository->show($id);

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
            'status'                 => 200,
            'message'                => config('status.status_code.200'),
            'info'                   => $info
        ]);
    }

    public function createItem($request)
    {

        $validator = Validator::make($request->all(),[

            'name'                   => 'required|string|min:3|max:100|unique:sources',
         

        ],[
            'name.required'          => 'Source Name required',
            'name.string'            => 'Source Name must be string',
            'name.min'               => 'Source Name minimum length 3',
            'name.max'               => 'Source Name maximum length 100',
            'name.unique'            => 'Source Name already taken',
            
        ]);

        if($validator->fails()) {

            return response()->json([
                'status'             => 400,
                'messages'           => config('status.status_code.400'),
                'errors'             => $validator->errors()->all()
            ]);

        }


        $data                        = $request->all();
        $data['slug']                = Helper::slugify($request->name);

        DB::beginTransaction();

        try {

            $id = $this->repository->create($data);
            Helper::storeLog([
                'action'            =>'insert',
                'operated_table'    =>'sources',
                'operated_row_id'   =>$id
            ]);
            $info                    = $this->repository->show($id = '');

        } catch (Exception $e) {

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
            'status'                 => 201,
            'messages'               => config('status.status_code.201'),
            'info'                   => $info
        ]);
    }



    public function updateItem($request,$id)
    {   
        $error = [];
      
        if(DB::table('sources')->select('name')->where('name','=',$request->name)->where('id','!=',$id)->first()){
           
            $error[] = 'Source Name already taken';
			
        }
        $validator = Validator::make($request->all(),[
            'name'                   => "required|string|min:3|max:100",
           
        ],[
            'name.required'          => 'Source Name required',
            'name.string'            => 'Source Name must be string',
            'name.min'               => 'Source Name minimum length 3',
            'name.max'               => 'Source Name maximum length 100',
            
        ]);

        if($validator->fails() || count($error)) {

            return response()->json([
                'status'             => 400,
                'messages'           => config('status.status_code.400'),
                'errors'            => array_merge($error, $validator->errors()->all())
            ]);

        }

        $data                        = $request->all();
        // $data['slug']              = Helper::slugify($data['title']);
        if (isset($data['name'])){
            $data['slug']            = Helper::slugify($data['name']);
        }


        DB::beginTransaction();

        try {
            $sourceLog = Source::findOrFail($id);
            $this->repository->update($data, $id);
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'sources',
                'operated_row_id'   => $sourceLog->id,
                'previous_data'     => json_encode($sourceLog)
            ]);
            $info                    = $this->repository->show($id);


        } catch (Exception $e) {

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
            'status'                 => 200,
            'messages'               => config('status.status_code.200'),
            'info'                   => $info
        ]);

    }


    public function deleteItem($id)
    {
        DB::beginTransaction();

        try {

            $childCheck           = Source::where('parent_id', $id)->get();
            $errors               = array();

            if (!empty($childCheck)){
                foreach ($childCheck as $child){
                    array_push($errors, "First delete the source name {$child->name}");
                }
            }

            if ($childCheck->isNotEmpty()){

                return response()->json([
                    'status_code'  => 620,
                    'messages'     => config('status.status_code.620'),
                    'errors'       => [$errors[0]]
                ]);

            }


            $source_exists = count(DB::table('tickets')->select('source_id')->where('source_id','=',$id)->get());

            if (!empty($source_exists)){
                return response()->json([
                    'status_code'   => 620,
                    'messages'      => config('status.status_code.620'),
                    'errors'        => [
//                        config('status.status_code.620')
                        "{$source_exists} Tickets are using this source"
                    ]
                ]);
            }
            $sourceLog = Source::findOrFail($id);
            $this->repository->delete($id);
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'sources',
                'operated_row_id'   => $sourceLog->id,
                'previous_data'     => json_encode($sourceLog)
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200')
        ]);
    }

}
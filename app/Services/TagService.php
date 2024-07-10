<?php


namespace App\Services;


use App\Helpers\Helper;
use App\Repositories\TagRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\Tag;

class TagService
{
    protected $repository;

    public function __construct(TagRepository $repository)
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

            'name'                  => 'required|string|min:3|max:100|unique:tags',
         

        ],[
            'name.required'         => 'Tag Name required',
            'name.string'           => 'Tag Name must be string',
            'name.min'              => 'Tag Name minimum length 3',
            'name.max'              => 'Tag Name maximum length 100',
            'name.unique'           => 'Tag Name already taken',
            
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
                'operated_table'    =>'tags',
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
    {   
        $error = [];
      
        if(DB::table('tags')->select('name')->where('name','=',$request->name)->where('id','!=',$id)->first()){
           
            $error[] = 'Tag Name already taken';
			
        }
        $validator = Validator::make($request->all(),[
            'name'                  => "required|string|min:3|max:100",
           
        ],[
            'name.required'         => 'Tag Name required',
            'name.string'           => 'Tag Name must be string',
            'name.min'              => 'Tag Name minimum length 3',
            'name.max'              => 'Tag Name maximum length 100',
           
        ]);

        if($validator->fails() || count($error)) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => array_merge($error,$validator->errors()->all())
            ]);

        }

        $data                      = $request->all();
        // $data['slug']              = Helper::slugify($data['title']);
        if (isset($data['name'])){
            $data['slug']           = Helper::slugify($data['name']);
        }


        DB::beginTransaction();

        try {
            $tagLog = Tag::findOrFail($id);
            $this->repository->update($data, $id);
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'tags',
                'operated_row_id'   => $tagLog->id,
                'previous_data'     => json_encode($tagLog)
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


            $tag_exists = count(DB::table('tickets')->select('tag_id')->where('tag_id','=',$id)->get());


            if (!empty($tag_exists)){
                return response()->json([
                    'status_code'   => 620,
                    'messages'      => config('status.status_code.620'),
                    'errors'        => [
//                        config('status.status_code.620')
                        "{$tag_exists} Tickets are using this tag"
                    ]
                ]);
            }
            $tagLog = Tag::findOrFail($id);

            $this->repository->delete($id);
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'tags',
                'operated_row_id'   => $tagLog->id,
                'previous_data'     => json_encode($tagLog)
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
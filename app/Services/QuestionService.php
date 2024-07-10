<?php


namespace App\Services;


use App\Helpers\Helper;
use App\Models\Question;
use App\Models\Type;
use App\Repositories\QuestionRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class QuestionService
{
    protected $repository;

    public function __construct()
    {

        $this->repository = new QuestionRepository;

    }

    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            $collections = $this->repository->listing($request);

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

    public function getQuestionsByCategory($catId)
    {

        DB::beginTransaction();

        try{

            $data = $this->repository->getQuestionsByCategory($catId);

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'   => 424,
                'messages' => config('status.status_code.424'),
                'error'    => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'       => 200,
            'message'      => config('status.status_code.200'),
            'collections'  => $data
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

            'type_id'       => 'required',
            'question'      => 'required'

        ], [
            'type_id.required' => 'The category field is required.'
        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }

        $data = $request->all();

        DB::beginTransaction();

        try {

            $id = $this->repository->create($data);
            Helper::storeLog([
                'action'            =>'insert',
                'operated_table'    =>'questions',
                'operated_row_id'   =>$id
            ]);
            $info   = $this->repository->show($id = '');

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
        $validator = Validator::make($request->all(),[

            'type_id'  => 'required',
            'question' => 'required'
           
        ],[
            
            'type_id.required' => 'The category field is required.'
           
        ]);

        if($validator->fails() || count($error)) {

            return response()->json([
                'status_code' => 400,
                'messages'    => config('status.status_code.400'),
                'errors'      => array_merge($error, $validator->errors()->all())
            ]);

        }

        $data = $request->all();
        DB::beginTransaction();

        try {

            $questionsLog = Question::findOrFail($id);
            $this->repository->update($data, $id);
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'questions',
                'operated_row_id'   => $questionsLog->id,
                'previous_data'     => json_encode($questionsLog)
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
            
            $type_exists = count(DB::table('ticket_questions')->select('question_id')->where('question_id','=',$id)->get());

            if (!empty($type_exists)){
                return response()->json([
                    'status_code'   => 620,
                    'messages'      => config('status.status_code.620'),
                    'errors'        => [
                        "{$type_exists} Tickets are using this question"
                    ]
                ]);
            }

            $questionLog = Question::findOrFail($id);

            $this->repository->delete($id);
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'questions',
                'operated_row_id'   => $questionLog->id,
                'previous_data'     => json_encode($questionLog)
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
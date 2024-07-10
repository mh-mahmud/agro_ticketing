<?php


namespace App\Repositories;


use App\Http\Traits\QueryTrait;
use App\Models\Question;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class QuestionRepository
{
    use QueryTrait;

    public function listing($request)
    {
        $query = (new Question())->with(['type:id,name,parent_id']);

        if ($request->filled('query')){

            $likeFilterList = ['question'];
            $whereFilterList = ['question'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);

        }
        
        if(isset($request->page) && $request->page == "*"){
            // Return All Data
            return $query->get();
        }

        return $query->paginate(config('others.ROW_PER_PAGE'));
    }

    public function getQuestionsByCategory($catId)
    {

        return Question::where('type_id', $catId)->get();

    }

    public function show($id)
    {

        if (!empty($id)){
            return Question::findorfail($id);
        }else{
            return Question::orderBy('created_at','DESC')->take(1)->get();
        }

    }

    public function create(array $data)
    {
        $dataObj                = new Question();
        $dataObj->type_id       = $data['sub_type_id'] ? $data['sub_type_id'] : $data['type_id'];
        $dataObj->question      = $data['question'];
        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        $dataObj->save();
        return $dataObj->id;
    }

    public function update(array $data, $id)
    {
        if ($dataObj = Question::where('id', $id)->first()) {
    
            $dataObj->type_id       = $data['sub_type_id'] ? $data['sub_type_id'] : $data['type_id'];
            $dataObj->question      = $data['question'];
            $dataObj->updated_at    = Carbon::now()->timestamp;
            return $dataObj->save();
    
        } else {
            throw new Exception("Not found!");
        }
    }

    public function delete($id)
    {
        return Question::find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }
}
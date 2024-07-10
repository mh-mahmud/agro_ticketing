<?php


namespace App\Repositories;


use App\Http\Traits\QueryTrait;
use App\Models\TicketQuestion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TicketQuestionRepository
{
    use QueryTrait;

    // public function listing($request)
    // {
    //     $query = DB::table('tags');

    //     if ($request->filled('query')){

    //         $likeFilterList = ['name'];
    //         $whereFilterList = ['name'];
    //         $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);

    //     }
        
    //     if(isset($request->page) && $request->page == "*"){
    //         // Return All Data
    //         return $query->get();
    //     }

    //     return $query->paginate(config('others.ROW_PER_PAGE'));

    // }
    public function listing($request)
    {
        /* if ($request->filled('query')){
            $query = DB::table('tags');
            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
            return $query->orderBy('created_at','DESC')->paginate(15);
        }else{
            return Tag::orderBy('created_at','DESC')->paginate(15);
        } */

    }

    public function show($id)
    {
        /* if (!empty($id)){
            return Tag::findorfail($id);
        }else{
            return Tag::orderBy('created_at','DESC')->take(1)->get();
        } */

    }

    public function create(array $data)
    {
        
        $dataObj              = new TicketQuestion();
        $dataObj->ticket_id   = $data['ticket_id'];
        $dataObj->question_id = $data['question_id'];
        $dataObj->answer      = $data['answer'] ?? '';
        $dataObj->save();
        return $dataObj;

    }

    public function update(array $data)
    {
        
        DB::table('ticket_questions')->where([
                'ticket_id'     => $data['ticket_id'], 
                'question_id'   => $data['pre_question_id']
            ])->update([
                'question_id'   => $data['question_id'],
                'answer'        => $data['answer']
            ]);

    }

    public function delete(array $data)
    {
        
        return DB::table('ticket_questions')->where([
                    'ticket_id'     => $data['ticket_id'], 
                    'question_id'   => $data['pre_question_id']
                ])->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        /* $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query; */

    }
}
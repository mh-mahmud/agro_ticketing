<?php


namespace App\Repositories;


use App\Http\Traits\QueryTrait;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Auth;

class MessageRepository
{
    use QueryTrait;

    public function listing($request)
    {
        if ($request->filled('query')){
            $query = Message::with('tickets', 'media');
            $likeFilterList = ['message'];
            $whereFilterList = ['message'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
            return $query->orderBy('created_at','DESC')->paginate(15);
        }else{
            return Message::with('tickets', 'media')->orderBy('created_at','DESC')->paginate(15);
        }

    }

    public function show($id)
    {

        return Message::with(
            'tickets:id,subject',
            'messages',
            'media'
        )->findOrFail($id);

    }

    public function create(array $data)
    {
        $dataObj                = new Message();
        $dataObj->id            = $data['id'];
        $dataObj->ticket_id     = $data['ticket_id'];
        $dataObj->message       = $data['message'];
        $dataObj->crm_user_id   = $data['crm_user_id'] ?? null;
        $dataObj->crm_user_name = $data['crm_user_name'] ?? null;
        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        $dataObj->replied_by    = Auth::user()->id;
        return $dataObj->save();
    }

    public function update(array $data, $id)
    {
        $dataObj            = Message::findorfail($id);
        $dataObj->ticket_id      = $data['ticket_id'];
        $dataObj->message      = $data['message'];
//        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        return $dataObj->save();
    }

    public function delete($id)
    {
        return Message::find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }
}
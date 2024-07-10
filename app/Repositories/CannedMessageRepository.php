<?php


namespace App\Repositories;


use App\Http\Traits\QueryTrait;
use App\Models\CannedMessage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CannedMessageRepository
{
    use QueryTrait;

    public function listing($request)
    {
        if(isset($request->page) && $request->page == "*"){
            return CannedMessage::get();
        }elseif ($request->filled('query')){
            $query = DB::table('canned_messages');
            $likeFilterList = ['title'];
            $whereFilterList = ['title'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
            return $query->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));
        }else{
            return CannedMessage::orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));
        }

    }

    public function show($id)
    {
        if (!empty($id)){
            return CannedMessage::findorfail($id);
        }else{
            return CannedMessage::orderBy('created_at','DESC')->take(1)->get();
        }

    }

    public function create(array $data)
    {
        $dataObj                = new CannedMessage();
        $dataObj->title         = $data['title'];
        $dataObj->description   = $data['description'];
        $dataObj->slug          = $data['slug'];
        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        $dataObj->save();
        return $dataObj;
    }

    public function update(array $data, $id)
    {
        $dataObj            = CannedMessage::findorfail($id);
        $dataObj->title      = $data['title'];
        $dataObj->description      = $data['description'];
        $dataObj->slug      = $data['slug'];
//        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        return $dataObj->save();
    }

    public function delete($id)
    {
        return CannedMessage::find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }
}
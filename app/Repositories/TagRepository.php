<?php


namespace App\Repositories;


use App\Http\Traits\QueryTrait;
use App\Models\Tag;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TagRepository
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
        if ($request->filled('query')){
            $query = DB::table('tags');
            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
            return $query->orderBy('created_at','DESC')->paginate(15);
        }else{
            return Tag::orderBy('created_at','DESC')->paginate(15);
        }

    }

    public function show($id)
    {
        if (!empty($id)){
            return Tag::findorfail($id);
        }else{
            return Tag::orderBy('created_at','DESC')->take(1)->get();
        }

    }

    public function create(array $data)
    {
        $dataObj                = new Tag();
        $dataObj->name          = $data['name'];
        $dataObj->slug          = $data['slug'];
        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        $dataObj->save();
        // return $dataObj->save();
        return $dataObj->id;
    }

    public function update(array $data, $id)
    {
        $dataObj            = Tag::findorfail($id);
        $dataObj->name      = $data['name'];
        $dataObj->slug      = $data['slug'];
//        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        return $dataObj->save();
    }

    public function delete($id)
    {
        return Tag::find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }
}
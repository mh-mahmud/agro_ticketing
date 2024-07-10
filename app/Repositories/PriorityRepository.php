<?php


namespace App\Repositories;


use App\Http\Traits\QueryTrait;
use App\Models\Priority;
use Carbon\Carbon;
use Exception;

class PriorityRepository
{
    use QueryTrait;

    public function listing($request)
    {
        $query = new Priority();

        if ($request->filled('query')){

            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);

        }

        if(isset($request->page) && $request->page == "*"){
            // Return All Data
            return $query->get();
        }

        return $query->paginate(config('others.ROW_PER_PAGE'));

    }

    public function show($id)
    {
        if (!empty($id)){
            return Priority::findorfail($id);
        }else{
            return Priority::orderBy('created_at','DESC')->take(1)->get();
        }

    }

    public function create(array $data)
    {
        $dataObj                = new Priority();
        $dataObj->name          = $data['name'];
        $dataObj->slug          = $data['slug'];
        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        $dataObj->save();
        return $dataObj;
    }
    


    public function update(array $data, $id)
    {
        if ($dataObj = Priority::where('id', $id)->first()) {
    
            $dataObj->name         = $data['name'];
            $dataObj->slug         = $data['slug'];
            $dataObj->updated_at   = Carbon::now()->timestamp;
            return $dataObj->save();
    
        } else {
            throw new Exception("Not found!");
        }
    }

    public function delete($id)
    {
        return Priority::find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }
}

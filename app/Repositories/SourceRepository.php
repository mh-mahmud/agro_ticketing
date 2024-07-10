<?php

namespace App\Repositories;

use App\Http\Traits\QueryTrait;
use App\Models\Source;
use Exception;

class SourceRepository
{
    use QueryTrait;

    public function listing($request)
    {
        $query = new Source();
        if ($request->filled('query')){
            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
        }

        if(isset($request->page) && $request->page == "*"){
            // Return All Data
            return $query->with('parentRecursive')->get();
        }

        return $query->with('parentRecursive')->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));

    }

    public function show($id)
    {
        if (!empty($id)){
            return Source::with('parentRecursive')->findorfail($id);
        }else{
            return Source::with('parentRecursive')->orderBy('created_at','DESC')->take(1)->get();
        }

    }

    public function create(array $data)
    {
        $dataObj                    = new Source();
        $dataObj->name              = $data['name'];
        $dataObj->slug              = $data['slug'];
        $dataObj->parent_id         = $data['parent_id'];
        $dataObj->save();
        return $dataObj->id;
    }

    // public function update(array $data, $id)
    // {
    //     $dataObj                    = Source::with('parentRecursive')->findorfail($id);
    //     $dataObj->name              = $data['name'];
    //     $dataObj->slug              = $data['slug'];
    //     $dataObj->parent_id         = $data['parent_id'] != $id ? $data['parent_id'] : 0;
    //     return $dataObj->save();
    // }

    public function update(array $data, $id)
    {
        if ($dataObj =Source::with('parentRecursive')->where('id', $id)->first()) {
    
            $dataObj->name              = $data['name'];
            $dataObj->slug              = $data['slug'];
            $dataObj->parent_id         = $data['parent_id'] != $id ? $data['parent_id'] : 0;
            return $dataObj->save();
    
        } else {
            throw new Exception("Not found!");
        }
    }

    public function delete($id)
    {
        return Source::with('parentRecursive')->find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }

}
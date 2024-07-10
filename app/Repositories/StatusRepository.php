<?php

namespace App\Repositories;

use App\Http\Traits\QueryTrait;
use App\Models\Status;
use Carbon\Carbon;
use Exception;

class StatusRepository
{
    use QueryTrait;

    public function listing($request)
    {

        $query = Status::orderBy('created_at','DESC');

        if ($request->filled('query') || $request->filled('slug')){

            $likeFilterList     = ['name', 'slug'];
            $whereFilterList    = ['name', 'slug'];
            $query = self::filterTask($request, $query, $whereFilterList, $likeFilterList);

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
            return Status::findorfail($id);
        }else{
            return Status::orderBy('created_at','DESC')->take(1)->get();
        }

    }


    public function create(array $data)
    {
        $dataObj                = new Status();
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
        if ($dataObj = Status::where('id', $id)->first()) {
    
            $dataObj->name         = $data['name'];
            $dataObj->updated_at   = Carbon::now()->timestamp;
            return $dataObj->save();
    
        } else {
            throw new Exception("Not found!");
        }
    }

    public function delete($id)
    {
        return Status::find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }
}
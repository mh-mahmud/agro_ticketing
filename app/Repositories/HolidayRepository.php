<?php

namespace App\Repositories;

use App\Http\Traits\QueryTrait;
use App\Models\Holiday;
use Exception;

class HolidayRepository
{
    use QueryTrait;

    public function listing($request)
    {

        $query = (new Holiday())->select(['id', 'name', 'date']);
        if ($request->filled('query')){
            $likeFilterList  = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
        }

        if(isset($request->page) && $request->page == "*"){
            // Return All Data
            return $query->get();
        }elseif($request->year){
            return $query->whereBetween('date', [$request->year . '-01-01', $request->year . '-12-31'])->get();
        }

        return $query->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));

    }

    public function show($id)
    {
        if (!empty($id)){
            return Holiday::findorfail($id);
        }else{
            return Holiday::orderBy('created_at','DESC')->take(1)->get();
        }
    }

    public function create(array $data)
    {
        $dataObj       = new Holiday();
        $dataObj->name = $data['name'];
        $dataObj->date = $data['date'];
        $dataObj->save();
        return $dataObj->id;
    }

    public function update(array $data, $id)
    {
        if($dataObj = Holiday::where('id', $id)->first()) {
    
            $dataObj->name = $data['name'];
            $dataObj->date = $data['date'];
            return $dataObj->save();
    
        }else{
            throw new Exception("Not found!");
        }
    }

    public function delete($id)
    {
        return Holiday::find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {

        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }
    
}
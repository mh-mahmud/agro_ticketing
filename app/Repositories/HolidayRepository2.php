<?php

namespace App\Repositories;

use App\Http\Traits\QueryTrait;
use App\Models\Holiday;
use Exception;

class HolidayRepository2 {

    public function show($id) 
    {
        if(!empty($id)) 
            Holiday::findorfail($id);
        else 
            Holiday::orderBy('created_at','DESC')->take(1)->get();
    }

    public function create(array $data)
    {
        $dataObj        = new Holiday();
        $dataObj->name  = $data["name"];
        $dataObj->date  = $data["date"];
        $dataObj->save();
        return $dataObj->id;
    }

    public function update(array $data, $id)
    {
        if($dataObj = Holiday::where('id', $id)->first()) {
            $dataObj->name  = $data["name"];
            $dataObj->date  = $data["date"];
            return $dataObj->save();
        } else {
            throw new Exception("Not found!");
        }
    }
    
}
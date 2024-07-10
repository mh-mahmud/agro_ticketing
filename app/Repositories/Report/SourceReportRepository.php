<?php

namespace App\Repositories;

use App\Http\Traits\QueryTrait;
use App\Models\Source;

class SourceReportRepository
{

    public function getDateWise($startDate, $endDate, $sourceId)
    {
        dd($startDate, $endDate, $sourceId);
        /* 
        if ($request->filled('query')){
            $query = new Source();
            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
            return $query->with('parentRecursive')->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));
        }else{
            return Source::with('parentRecursive')->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));
        } */

    }

}
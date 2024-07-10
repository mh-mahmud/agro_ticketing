<?php


namespace App\Repositories;


use App\Http\Traits\QueryTrait;
use App\Models\Timezone;
use Illuminate\Support\Facades\DB;

class TimezoneRepository
{
    use QueryTrait;
    public function listing($request)
    {

        if ($request->filled('query'))
        {
            $query = DB::table('timezones');
            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
            return $query->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));

        }else{
            return Timezone::select('id','timezone','code','utc_offset','utc_dst_offset')->orderBy('created_at','DESC')->get();
        }

    }
}
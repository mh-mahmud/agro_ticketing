<?php


namespace App\Repositories;


use App\Helpers\Helper;
use App\Http\Traits\QueryTrait;
use App\Models\BusinessHour;
use Carbon\Carbon;


class BusniessHourRepository
{
    use QueryTrait;
    public function __construct(TimeSlotRepository $timeSlotRepository)
    {


        $this->timeSlotRepository             = $timeSlotRepository;

    }
    public function listing($request)
    {
        $query = BusinessHour::with('timeSlots');
        if ($request->filled('query'))
        {
            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
            $query->orderBy('created_at','DESC');

        }else{
            $query->orderBy('created_at','DESC');
        }

        return $query->paginate(config('others.ROW_PER_PAGE'));

    }

    public function show($id)
    {
        if (!empty($id)){
            return BusinessHour::with('timeSlots')->findorfail($id);
        }else{
            return BusinessHour::with('timeSlots')->orderBy('created_at','DESC')->take(1)->get();
        }

    }

    public function create(array $data)
    {
        $dataObj                    = new BusinessHour();
        $dataObj->id                = $data['id'];
        $dataObj->name              = $data['name'];
        $dataObj->slug              = $data['slug'];
        $dataObj->description       = $data['description'];
        $dataObj->time_zone_id      = $data['time_zone_id'];
        $dataObj->status            = $data['status'] ?: 0;
        $dataObj->created_at        = Carbon::now()->timestamp;
        $dataObj->updated_at        = Carbon::now()->timestamp;
        $dataObj->save();
        return $data['id'];
    }

    public function update(array $data, $id)
    {
        $dataObj                    = BusinessHour::with('timeSlots')->findorfail($id);
        $dataObj->name              = $data['name'];
        $dataObj->slug              = Helper::slugify($data['slug']);
        $dataObj->description       = $data['description'];
        $dataObj->time_zone_id      = $data['time_zone_id'];
        $dataObj->status            = $data['status'];
        $dataObj->updated_at        = Carbon::now()->timestamp;
        $dataObj->save();
        return $dataObj;
    }

    public function delete($id)
    {
        $business_hour =  BusinessHour::with('timeSlots')->findorfail($id);

        if (count($business_hour->timeSlots) > 0){
            foreach ($business_hour->timeSlots as $aSlot){
                $this->timeSlotRepository->delete($aSlot->id);
            }
        }

        return $business_hour->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }

}
<?php


namespace App\Repositories;


use App\Http\Traits\QueryTrait;
use App\Models\TimeSlot;
use Carbon\Carbon;

class TimeSlotRepository
{
    use QueryTrait;
    public function listing($request)
    {

        return TimeSlot::with('businessHour')->orderBy('created_at','DESC')->paginate(15);

    }


    public function create(array $data)
    {
        $dataObj                        = new TimeSlot();
        $dataObj->business_hour_id      = $data['business_hour_id'];
        $dataObj->day                   = $data['day'];
        $dataObj->start_time            = $data['start_time'];
        $dataObj->end_time              = $data['end_time'];
        $dataObj->created_at            = Carbon::now()->timestamp;
        $dataObj->updated_at            = Carbon::now()->timestamp;
        return $dataObj->save();
    }


    public function show($id)
    {
        if (!empty($id)){
            return TimeSlot::findorfail($id);
        }else{
            return TimeSlot::orderBy('created_at','DESC')->take(1)->get();
        }

    }


    public function update(array $data, $id)
    {
        $dataObj                    = TimeSlot::findorfail($id);
        $dataObj->business_hour_id      = $data['business_hour_id'];
        $dataObj->day                   = $data['day'];
        $dataObj->start_time            = $data['start_time'];
        $dataObj->end_time              = $data['end_time'];
        return $dataObj->save();
    }

    public function delete($id)
    {
        return TimeSlot::find($id)->delete();
    }

    public function deleteByBusinessHour($business_hour_id)
    {
        return TimeSlot::where('business_hour_id','=',$business_hour_id)->delete();
    }
}
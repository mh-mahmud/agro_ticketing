<?php

namespace App\Services;

use App\Helpers\Helper;
use App\Models\BusinessHour;
use App\Repositories\BusniessHourRepository;
use App\Repositories\TimeSlotRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BusinessHourService
{
    protected $repository;

    public function __construct(BusniessHourRepository $repository, TimeSlotRepository $timeSlotRepository)
    {

        $this->repository             = $repository;
        $this->timeSlotRepository             = $timeSlotRepository;

    }

    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            $collections              = $this->repository->listing($request);

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'             => 424,
                'messages'           => config('status.status_code.424'),
                'error'              => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200'),
            'collections'           => $collections
        ]);
    }

    public function showItem($id)
    {

        DB::beginTransaction();

        try{

            $info                   = $this->repository->show($id);

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'message'               => config('status.status_code.200'),
            'info'                  => $info
        ]);
    }


    public function createItem($request)
    {

        $validator = Validator::make($request->all(),[

            'name'                  => 'required|string|min:3|max:200|unique:business_hours',

        ],[
            'name.required'         => 'Business hours name required',
            'name.string'           => 'Business hours name must be string',
            'name.min'              => 'Business hours name minimum length 3',
            'name.max'              => 'Business hours name maximum length 20',
            'name.unique'           => 'Business hours name already taken',
        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }


        $input                      = $request->all();
        $input['id']                = Helper::idGenarator();
        $input['slug']              = Helper::slugify($input['name']);

        DB::beginTransaction();


        try {

            $id = $this->repository->create($input);

            Helper::storeLog([
                'action'            => 'insert',
                'operated_table'    => 'business_hours',
                'operated_row_id'   => $id
            ]);

            $info                   = $this->repository->show($input['id']);

            if (!empty($input['time_slots'])){

                $time_slots = json_decode($input['time_slots']);

                foreach ($time_slots as $slot){

                    $time_slot_array['business_hour_id'] = $input['id'];
                    $time_slot_array['day']              = $slot->name;
                    $time_slot_array['start_time']       = $slot->start_time;
                    $time_slot_array['end_time']         = $slot->end_time;
                    /* Validate start and end time */
                    if( strtotime(date('Y-m-d') . ' ' . $slot->end_time) < strtotime(date('Y-m-d') . ' ' . $slot->start_time) ){
                        throw new Exception('Please enter a valid time.');
                    }
                    $this->timeSlotRepository->create($time_slot_array);
                }

            }

        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code'       => 424,
                'messages'          => config('status.status_code.424'),
                'errors'            => [$e->getMessage()]
            ]);
        }

        DB::commit();

        return response()->json([
            'status_code'           => 201,
            'messages'              => config('status.status_code.200'),
            'info'                  => $info
        ]);
    }

    public function updateItem($request,$id)
    {   
        $error = [];
      
        if(DB::table('business_hours')->select('name')->where('name','=',$request->name)->where('id','!=',$id)->first()){
           
            $error[] = 'Business hours name already taken';
			
        }
        $validator = Validator::make($request->all(),[
            'name'                  => "required|string|min:3|max:200",
        ],[
            'name.required'         => 'Business hours name required',
            'name.string'           => 'Business hours name must be string',
            'name.min'              => 'Business hours name minimum length 3',
            'name.max'              => 'Business hours name maximum length 20',
           
        ]);

        if($validator->fails() || count($error)) {

            return response()->json([
                'status'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => array_merge($error, $validator->errors()->all())
            ]);

        }

        $input                      = $request->all();
        $input['slug']              = Helper::slugify($input['name']);

        DB::beginTransaction();

        try {

            $businessHour = BusinessHour::findOrFail($id);
            $this->repository->update($input, $id);
            
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'business_hours',
                'operated_row_id'   => $businessHour->id,
                'previous_data'     => json_encode($businessHour)
            ]);

            $info                   = $this->repository->show($id);


            if (!empty($input['time_slots'])){

                $time_slots = json_decode($input['time_slots']);

                $this->timeSlotRepository->deleteByBusinessHour($input['id']);


                foreach ($time_slots as $slot){

                    $time_slot_array['business_hour_id'] = $input['id'];
                    $time_slot_array['day'] = $slot->name;
                    $time_slot_array['start_time'] = $slot->start_time;
                    $time_slot_array['end_time'] = $slot->end_time;
                    /* Validate start and end time */
                    if( strtotime(date('Y-m-d') . ' ' . $slot->end_time) < strtotime(date('Y-m-d') . ' ' . $slot->start_time) ){
                        throw new Exception('Please enter a valid time.');
                    }
                    $this->timeSlotRepository->create($time_slot_array);
                }


            }


        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code'       => 424,
                'messages'          => config('status.status_code.424'),
                'errors'            => [$e->getMessage()]
            ]);
        }

        DB::commit();

        return response()->json([
            'status_code'           => 200,
            'messages'              => config('status.status_code.200'),
            'info'                  => $info
        ]);

    }

    public function deleteItem($id)
    {
        DB::beginTransaction();

        try {

            $businessHour = BusinessHour::with('timeSlots')->findOrFail($id);

            $this->repository->delete($id);
             
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'business_hours',
                'operated_row_id'   => $businessHour->id,
                'previous_data'     => json_encode($businessHour)
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code' => 424,
                'messages'=>config('status.status_code.424'),
                'error' => $e->getMessage()]);
        }

        DB::commit();

        return response()->json([
            'status_code' => 200,
            'messages'=>config('status.status_code.200')
        ]);
    }
}
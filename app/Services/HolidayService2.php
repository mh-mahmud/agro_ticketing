<?php

namespace App\Services;


use App\Repositories\HolidayRepository;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Helpers\Helper;
use Illuminate\Support\Facades\Log;
use App\Models\Holiday;
use Exception;

class HolidayService2 {
    protected $holidayRepository;

    public function __construct()
    {
        $this->holidayRepository = new HolidayRepository();
    }

    public function createItem($request)
    {
        $validator = Validator::make($request->all(),[

            'name' => 'required',
            'date' => 'required'
        
        ]);

        if($validator->fails()) {

            return response()->json([
                'status'             => 400,
                'messages'           => config('status.status_code.400'),
                'errors'             => $validator->errors()->all()
            ]);

        }

        $data = $request->all();
        DB::beginTransaction();
        try {
            $id = $this->holidayRepository->create($data);
            Helper::storeLog([
                'action'            => 'insert',
                'operated_table'    => 'holidays',
                'operated_row_id'   => $id
            ]);
        } catch (Exception $e) {
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');
            DB::rollBack();

        }

        DB::commit();

        return response()->json([
            'status'                 => 201,
            'messages'               => config('status.status_code.201'),
            // 'info'                   => $info
        ]);
    }

    public function updateItem($request, $id)
    {
        $validator = Validator::make($request->all(),[

            'name' => 'required',
            'date' => 'required'
        
        ]);

        if($validator->fails()) {

            return response()->json([
                'status'             => 400,
                'messages'           => config('status.status_code.400'),
                'errors'             => $validator->errors()->all()
            ]);

        }

        $data = $request->all();
        DB::beginTransaction();
        try {
            $holidayLog = Holiday::findOrFail($id);
            $this->holidayRepository->update($data, $id);
            Helper::storeLog([
                'action'          => 'update',
                'operated_table'  => 'holidays',
                'operated_row_id' => $holidayLog->id,
                'previous_data'   => json_encode($holidayLog)
            ]);
        } catch (Exception $e) {
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');
            DB::rollBack();

        }

        DB::commit();

        return response()->json([
            'status'                 => 201,
            'messages'               => config('status.status_code.201'),
            // 'info'                   => $info
        ]);
    }
}
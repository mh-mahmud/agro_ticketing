<?php


namespace App\Services;


use App\Helpers\Helper;
use App\Models\Holiday;
use App\Models\Source;
use App\Repositories\HolidayRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class HolidayService
{
    protected $repository;

    public function __construct()
    {

        $this->holidayRepository = new HolidayRepository();

    }

    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            $collections = $this->holidayRepository->listing($request);

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'              => 424,
                'messages'            => config('status.status_code.424'),
                'error'               => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                 => 200,
            'messages'               => config('status.status_code.200'),
            'collections'            => $collections
        ]);
    }

    public function showItem($id)
    {
/* 
        DB::beginTransaction();

        try{

            $info                    = $this->holidayRepository->show($id);

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
            'status'                 => 200,
            'message'                => config('status.status_code.200'),
            'info'                   => $info
        ]); */
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
            $info = $this->holidayRepository->show($id = '');

        } catch (Exception $e) {

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
            'status'                 => 201,
            'messages'               => config('status.status_code.201'),
            'info'                   => $info
        ]);
    }



    public function updateItem($request,$id)
    {
        $error = [];

        $validator = Validator::make($request->all(),[
            'name' => 'required',
            'date' => 'required'
        ]);

        if($validator->fails() || count($error)) {

            return response()->json([
                'status'   => 400,
                'messages' => config('status.status_code.400'),
                'errors'   => array_merge($error, $validator->errors()->all())
            ]);

        }

        $data = $request->all();
        if(isset($data['name'])){
            $data['slug'] = Helper::slugify($data['name']);
        }

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
            $info = $this->holidayRepository->show($id);

        } catch (Exception $e) {

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
            'status'                 => 200,
            'messages'               => config('status.status_code.200'),
            'info'                   => $info
        ]);

    }

    public function deleteItem($id)
    {
        DB::beginTransaction();

        try {

            $errors     = array();

            $holidayLog = Holiday::findOrFail($id);
            $this->holidayRepository->delete($id);
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'holidays',
                'operated_row_id'   => $holidayLog->id,
                'previous_data'     => json_encode($holidayLog)
            ]);

        } catch (Exception $e) {

            DB::rollBack();

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200')
        ]);
    }

}
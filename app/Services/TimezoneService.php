<?php


namespace App\Services;


use App\Repositories\TimezoneRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TimezoneService
{
    protected $repository;

    public function __construct(TimezoneRepository $repository)
    {

        $this->repository             = $repository;

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
}
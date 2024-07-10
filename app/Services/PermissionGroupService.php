<?php
namespace App\Services;

use App\Helpers\Helper;
use App\Repositories\PermissionGroupRepository;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use DB;

class PermissionGroupService
{
    protected $permissionGroupRepository;

    public function __construct(PermissionGroupRepository $permissionGroupRepository)
    {

        $this->permissionGroupRepository = $permissionGroupRepository;

    }


    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            $listing = $this->permissionGroupRepository->listing($request);

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'    => 424,
                'messages'  => config('status.status_code.424'),
                'error'     => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                 => 200,
            'messages'               => config('status.status_code.200'),
            'permission_group_list'  => $listing
        ]);
    }
}

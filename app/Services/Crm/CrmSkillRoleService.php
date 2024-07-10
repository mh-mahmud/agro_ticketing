<?php

namespace App\Services\Crm;

use App\Helpers\Helper;
use App\Models\Status;
use App\Repositories\StatusRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Repositories\Crm\CrmSkillRoleRepository;
use Illuminate\Validation\Rule;

class CrmSkillRoleService
{
    protected $crmSkillRoleRepository;

    public function __construct()
    {

        $this->crmSkillRoleRepository   = new CrmSkillRoleRepository;

    }

    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            $collections              = $this->crmSkillRoleRepository->listing($request);

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

    /* public function showItem($id)
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
    } */

    public function createItem($request)
    {

        $validator = Validator::make($request->all(),[

            'skill_id'  => 'required|unique:crm_skill_role,skill_id',
            'role_id'    => 'required'

        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'   => 400,
                'messages'      => config('status.status_code.400'),
                'errors'        => $validator->errors()->all()
            ]);

        }

        $input  = $request->all();

        DB::beginTransaction();

        try {

            $id = $this->crmSkillRoleRepository->create($input);
            Helper::storeLog([
                'action'            =>'insert',
                'operated_table'    =>'crm_skill_role',
                'operated_row_id'   =>$id
            ]);
            $info   = DB::table('crm_skill_role')->find($id);

        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code'       => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
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
        $validator = Validator::make($request->all(),[
            'skill_id'  => ['required', Rule::unique('crm_skill_role', 'skill_id')->ignore($id)],
            'role_id'   => 'required'
        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'   => 400,
                'messages'      => config('status.status_code.400'),
                'errors'        => $validator->errors()->all()
            ]);

        }

        $input  = $request->all();

        DB::beginTransaction();

        try {

            if($previousData = DB::table('crm_skill_role')->find($id)){

                $this->crmSkillRoleRepository->update($input, $id);
                Helper::storeLog([
                    'action'            => 'update',
                    'operated_table'    => 'crm_skill_role',
                    'operated_row_id'   => $previousData->id,
                    'previous_data'     => json_encode($previousData)
                ]);
                $info   = DB::table('crm_skill_role')->find($id);
                
            }else{
                throw new Exception("Not found!");
            }

        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code'       => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
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

            if($previousData = DB::table('crm_skill_role')->find($id)){

                $this->crmSkillRoleRepository->delete($id);
                Helper::storeLog([
                    'action'            => 'delete',
                    'operated_table'    => 'crm_skill_role',
                    'operated_row_id'   => $previousData->id,
                    'previous_data'     => json_encode($previousData)
                ]);
                
            }else{
                throw new Exception("Not found!");
            }

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
<?php

namespace App\Services\Crm;

use App\Helpers\Helper;
use DB;
use Illuminate\Support\Facades\Hash;

class CrmApiService
{
    public function getSkillWisePermissions($skillId){
        if($skillRole = DB::table('crm_skill_role')->where('skill_id', $skillId)->first()){
            $permissions = DB::table('roles_permissions')
                            ->join('permissions', 'roles_permissions.permission_id', '=', 'permissions.id')
                            ->select(
                                'permissions.slug'
                            )
                            ->where('roles_permissions.role_id', $skillRole->role_id)
                            ->get()
                            ->pluck('slug')
                            ->toArray();
            return $permissions;
        }
        return false;
    }
}
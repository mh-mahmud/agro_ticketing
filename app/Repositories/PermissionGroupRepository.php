<?php
namespace App\Repositories;

use App\Models\PermissionGroup;

class PermissionGroupRepository
{
    public function listing($request)
    {

        $data = PermissionGroup::with('permissions')->select('id', 'name')->get();
        return $data;

    }
}

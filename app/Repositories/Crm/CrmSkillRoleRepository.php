<?php

namespace App\Repositories\Crm;

use App\Http\Traits\QueryTrait;
use App\Models\Status;
use Carbon\Carbon;
use DB;

class CrmSkillRoleRepository
{
    use QueryTrait;

    public function listing($request)
    {

        $query = DB::table('crm_skill_role')->orderBy('created_at','DESC');

        if(isset($request->page) && $request->page == "*"){
            // Return All Data
            return $query->get();
        }

        return $query->paginate(config('others.ROW_PER_PAGE'));
    }

    /* public function show($id)
    {
        if (!empty($id)){
            return Status::findorfail($id);
        }else{
            return Status::orderBy('created_at','DESC')->take(1)->get();
        }

    } */


    public function create(array $data)
    {
        $time = date('Y-m-d H:i:s');
        $id = DB::table('crm_skill_role')->insertGetId([
            'skill_id'  => $data['skill_id'],
            'role_id'   => $data['role_id'],
            'created_at'=> $time,
            'updated_at'=> $time
        ]);
        return $id;
    }


    public function update(array $data, $id)
    {
        return DB::table('crm_skill_role')
                ->where('id', $id)
                ->update([
                    'skill_id'  => $data['skill_id'],
                    'role_id'   => $data['role_id'],
                    'updated_at'=> date('Y-m-d H:i:s')
                ]);
    }

    public function delete($id)
    {
        return DB::table('crm_skill_role')->where('id', $id)->delete();
    }

}
<?php

namespace App\Services;

use App\Helpers\Helper;
use App\Models\Group;
use App\Repositories\GroupRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class GroupService
{
    protected $groupRepository;

    public function __construct()
    {

        $this->groupRepository = new GroupRepository;

    }

    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            $listing                = $this->groupRepository->listing($request);

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
            'messages'              => config('status.status_code.200'),
            'group_list'            => $listing
        ]);
    }

    public function createItem($request)
    {
        $validator = Validator::make($request->all(),[

            'name'                  => 'required|string|min:1|unique:groups'

        ]);

        if($validator->fails()) {

            return response()->json([
                'status'            => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }

        $data                       = $request->all();
        $data['slug']               = Helper::slugify($request->name);
        
        DB::beginTransaction();

        try{

            $groupData              = $this->groupRepository->create($data);

            Helper::storeLog([
                'action'            => 'insert',
                'operated_table'    => 'groups',
                'operated_row_id'   => $groupData->id
            ]);
            
            DB::table('groups_agents')->where('group_id', $groupData->id)->delete();

            if(isset($request->agents) && is_array($request->agents)){
                foreach($request->agents as $agentUser){
                    $groupData->users()->attach($agentUser);
                }
            }

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
            'status'                => 201,
            'message'               => config('status.status_code.201'),
            'group_created'         => $groupData
        ]);
    }

    public function updateItem($request,$id)
    {   
        $error = [];
      
        if(DB::table('groups')->select('name')->where('name','=',$request->name)->where('id','!=',$id)->first()){
           
            $error[] = 'Group name already taken';
			
        }
        $validator = Validator::make($request->all(),[

            'name'                  => "required|string|min:1"

        ]);

        if($validator->fails() || count($error)) {

            return response()->json([
                'status'            => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => array_merge($error, $validator->errors()->all())
            ]);

        }

        $data                       = $request->all();

        if (isset($data['name'])){
            $data['slug']           = Helper::slugify($data['name']);
        }

        DB::beginTransaction();

        try{

            $previousGroup          = Group::with('users:id')->findOrFail($id);
            $groupData              = $this->groupRepository->update($data, $id);
            
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'groups',
                'operated_row_id'   => $previousGroup->id,
                'previous_data'     => json_encode($previousGroup)
            ]);

            DB::table('groups_agents')->where('group_id', $groupData->id)->delete();

            if(isset($request->agents) && is_array($request->agents)){
                foreach($request->agents as $agentUser){
                    $groupData->users()->attach($agentUser);
                }
            }

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
            'group_created'         => $groupData
        ]);
    }

    public function deleteItem($id)
    {

        DB::beginTransaction();

        try{

            $childCheck           = Group::where('parent_id', $id)->get();
            $errors               = array();

            if (!empty($childCheck)){
                foreach ($childCheck as $child){
                    array_push($errors, "First delete the group name {$child->name}");
                }
            }

            if ($childCheck->isNotEmpty()){

                return response()->json([
                    'status_code'  => 620,
                    'messages'     => config('status.status_code.620'),
                    'errors'       => [$errors[0]]
                ]);

            }

            $group_exists = count(DB::table('tickets')->select('group_id')->where('group_id','=',$id)->get());

            if (!empty($group_exists)){
                return response()->json([
                    'status_code'   => 620,
                    'messages'      => config('status.status_code.620'),
                    'errors'        => [
                        "{$group_exists} Tickets are using this group"
                    ]
                ]);
            }

            $previousGroup          = Group::with('users:id')->findOrFail($id);
            $this->groupRepository->delete($id);
            
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'groups',
                'operated_row_id'   => $previousGroup->id,
                'previous_data'     => json_encode($previousGroup)
            ]);

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
        ]);

    }

    public function getAgentByGroup($id)
    {

        DB::beginTransaction();

        try{

            $listing                = $this->groupRepository->getAgentByGroup($id);

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
            'messages'              => config('status.status_code.200'),
            'collection'            => $listing
        ]);
    }

    public function getGroupTree(){
        $allGroup = $this->groupRepository->getAll(['id', 'name', 'parent_id', 'need_ticket_approval'])->toArray();
        $new = array();
        foreach ($allGroup as $group){
            $new[ $group['parent_id'] ][] = $group;
        }
        
        $tree = $this->createTree($new, $new[0]);

        return $tree;
        // dd($this->searchTreeByGroupId(9, $tree));
    }

    /**
     * @author Anisur Rahman Sagor
     */
    public function createTree(&$list, $parent, $needApproval=null){
        
        $tree = array();
        foreach ($parent as $k=>$l){
            /* If any parent is 1 then its all child should be 1 */
            if($l['need_ticket_approval'] == 1){
                $needApproval = 1;
            }
            if(isset($list[$l['id']])){
                $l['children'] = $this->createTree($list, $list[$l['id']], $needApproval);
            }
            $needApproval == 1 ? $l['need_ticket_approval'] = 1 : '';
            $tree[] = $l;
            $needApproval=null;
        }
        return $tree;

    }

    /**
     * @author Anisur Rahman Sagor
     */
    public function searchTreeByGroupId($id, $array) {
        foreach ($array as $val) {
            if ($val['id'] == $id) {
                return $val;
            }elseif(isset($val['children'])){
                return $this->searchTreeByGroupId($id, $val['children']);
            }
        }
     }

}
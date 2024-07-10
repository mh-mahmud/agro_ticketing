<?php


namespace App\Services;


use App\Helpers\Helper;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Role;

class RoleService
{
    protected $roleRepository;
    protected $userRepository;

    public function __construct(RoleRepository $roleRepository, UserRepository $userRepository)
    {

        $this->roleRepository       = $roleRepository;
        $this->userRepository       = $userRepository;

    }


    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            $listing                = $this->roleRepository->listing($request);

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
            'role_list'             => $listing
        ]);
    }

    public function showItem($id)
    {

        DB::beginTransaction();

        try{

            $role                   = $this->roleRepository->show($id);

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
            'role_info'             => $role
        ]);
    }


    public function createItem($request)
    {
        $validator = Validator::make($request->all(),[

            'name'                  => 'required|string|max:50|min:3|unique:roles',
            'permission'            => 'required',

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

            $role_info              = $this->roleRepository->create($data);
            Helper::storeLog([
                'action'            => 'insert',
                'operated_table'    => 'roles',
                'operated_row_id'   => $role_info->id
            ]);
            $role_info->permissions()->attach($request->input('permission'));
            $role_info              = $this->roleRepository->show($role_info->id);

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
            'role_created'          => $role_info
        ]);
    }

    public function updateItem($request,$id)
    {   
        $error = [];
      
        if(DB::table('roles')->select('name')->where('name','=',$request->name)->where('id','!=',$id)->first()){
           
            $error[] = 'Role name already taken';
			
        }
        $validator = Validator::make($request->all(),[
            'name'                  => "required|string|max:50|min:3",
            'permission'            => 'required',
        ]);

        if($validator->fails()  || count($error)) {

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

            $previousRole = Role::with('permissions')->findOrFail($id);
            
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'roles',
                'operated_row_id'   => $previousRole->id,
                'previous_data'     => json_encode($previousRole)
            ]);

            $this->roleRepository->update($data,$id);
            $role_info              = $this->roleRepository->show($id);
            DB::table('roles_permissions')->where('role_id', $id)->delete();
            $role_info->permissions()->attach($request->input('permission'));
            $role_info              = $this->roleRepository->show($id);
            //role updated with permission at the same time users permission updated
            $users_info = [];
            if (count($role_info->users) > 0){
                foreach ($role_info->users as $aUser){
                    DB::table('users_permissions')->where('user_id', $aUser->id)->delete();
                    $this->userRepository->show($aUser->id);
                    array_push($users_info, $this->userRepository->show($aUser->id));
                }
            }

            /* if (count($role_info->permissions) > 0){
                foreach ($role_info->permissions as $aPermission){
                    foreach ($users_info as $aUser){
                        $aUser->permissions()->attach($aPermission);
                    }
                }
            } */

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          =>config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200'),
            'role_info'             => $role_info
        ]);
    }


    public function deleteItem($id)
    {

        DB::beginTransaction();

        try{
            
            $previousRole = Role::with('permissions', 'users')->findOrFail($id);
            $roleUserCount = $previousRole->users->count();

            if($roleUserCount){
                return response()->json([
                    'status_code'   => 620,
                    'messages'      => config('status.status_code.620'),
                    'errors'        => [
                        "Cannot delete this! {$roleUserCount} users belongs this role."
                    ]
                ]);
            }

            DB::table('roles_permissions')->where('role_id', $id)->delete();
            $this->roleRepository->delete($id);

            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'roles',
                'operated_row_id'   => $previousRole->id,
                'previous_data'     => json_encode($previousRole)
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


    public function changeItemStatus($request, $id)
    {
        $data                       = $request->all();

        DB::beginTransaction();

        try{

            if (isset($data['status'])){
                $this->roleRepository->changeItemStatus($data, $id);
            }
            $role_info              = $this->roleRepository->show($id);

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
            'role_info'             => $role_info
        ]);

    }

    public function checkUniqueIdentity($request)
    {
        $data                       = $request->all();

        DB::beginTransaction();

        try{

            if (isset($data['name'])){
                $role_info          = $this->roleRepository->checkRoleName($data);
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

        if (count($role_info) == 0){
            return response()->json([
                'status'                => 200,
                'message'               => config('status.status_code.200'),
                'availability'          => 'Available'
            ]);
        }else{
            return response()->json([
                'status'                => 200,
                'message'               => config('status.status_code.200'),
                'availability'          => 'Taken'
            ]);
        }
    }
}

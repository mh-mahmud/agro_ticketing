<?php


namespace App\Services;


use App\Helpers\Helper;
use App\Models\Media;
use App\Models\User;
use App\Models\UserDetail;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserService
{

    protected $userRepository;
    protected $roleRepository;

    public function __construct()
    {

        $this->userRepository       = new UserRepository();
        $this->roleRepository       = new RoleRepository($this->userRepository);

    }

    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            if(array_key_exists("query", $request->all()) && $request->all()['query'] == 'nonUser'){

                $listing = $this->userRepository->listingNonUser($request);

            }else{

                $listing = $this->userRepository->listing($request);

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
            'messages'              => config('status.status_code.200'),
            'user_list'             => $listing
        ]);
    }


    public function showItem($id)
    {

        DB::beginTransaction();

        try{

            $user = $this->userRepository->show($id);

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
            'user_info'             => $user
        ]);
    }

    public function createItem($request)
    {
        $rules = [
            'first_name'            => 'required|string|max:50|min:2',
            'last_name'             => 'nullable|string|max:50|min:2',
            'email'                 => 'nullable|email|string|max:60|unique:user_details',
            'mobile'                => 'required|numeric|digits_between:10,15|unique:user_details',
            'image'                 => 'nullable|sometimes|mimes:jpeg,jpg,png,gif|max:10000'
        ];

        if($request->has('username')){
            $rules += [
                'username'          => 'required|string|max:50|min:4|unique:users',
                'password'          => 'required|same:confirm_password',
                'roles'             => 'required'
            ];
        }

        $validator = Validator::make($request->all(),$rules);

        if($validator->fails()) {

            return response()->json([
                'status'            => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }
        $data                       = $request->all();
        $data['id']                 = Helper::idGenarator();
        $data['slug']               = Helper::slugifyFullName($request->first_name,$request->middle_name,$request->last_name);

        DB::beginTransaction();

        try{
            $id =$this->userRepository->create($data);
            Helper::storeLog([
                'action'            =>'insert',
                'operated_table'    =>'users',
                'operated_row_id'   =>$id
            ]);
            $user_info              = $this->userRepository->show($data['id']);

            if(!is_array($roleIds = $request->input('roles'))){
                $roleIds = (array)json_decode($request->input('roles'));
            }

            /* $userRoles               = $this->roleRepository->showMultiple($roleIds);

            foreach($userRoles as $userRole){
                if (count($userRole->permissions) > 0){
                    foreach ($userRole->permissions as $aPermission){
                        $user_info->permissions()->attach($aPermission);
                    }
                }
            } */

            foreach($roleIds as $roleId){
                $user_info->roles()->attach($roleId);
            }

            if($request->hasFile('image')) {

                $imageUrl           = Helper::fileUpload("avatar/", $request->image);

                $user_info->media()->create([

                    'url'           => $imageUrl

                ]);
            }
            $user_info              = $this->userRepository->show($data['id']);

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
            'user_created'          => $user_info
        ]);
    }

    public function updateItem($request,$id)
    {
        $error = [];
        if ($checkUser = DB::table('users')->join('user_details', 'users.id', '=', 'user_details.id')->select('username', 'email', 'mobile')->where('users.id', '!=', $id)->where(function ($query)  use ($request) {
            $query->where('username', '=', $request->username)
                ->orWhere('email', $request->email)
                ->orWhere('mobile', $request->mobile);
        })->first()) {
            if ($checkUser->username == $request->username) {

                $error[] = 'Username already taken';
            } elseif ($checkUser->mobile == $request->mobile) {

                $error[] = 'Mobile Number already taken';
            } elseif ($checkUser->email == $request->email) {

                $error[] = 'Email already taken';
            } else {
                $error[] = 'No Error';
            }
        }

        $rules = [
            'first_name'    => 'required|string|max:50|min:2',
            'last_name'     => 'nullable|string|max:50|min:2',
            'username'      => "required|string|max:50|min:4",
            'email'         => "required|email|string|max:60",
            'mobile'        => "required|numeric|digits_between:10,15",
            'password'      => 'nullable|same:confirm_password'
        ];

        $validator = Validator::make($request->all(), $rules);

        if($validator->fails() || count($error)) {

            return response()->json([
                'status'            => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => array_merge($error, $validator->errors()->all())
            ]);

        }

        $data                       = $request->all();

        if (isset($data['first_name'])){
            $data['slug']           = Helper::slugifyFullName($request->first_name,$request->middle_name,$request->last_name);
        }

        DB::beginTransaction();

        try{
            $userLog = UserDetail::leftJoin('users', 'user_details.id', '=', 'users.id')->findOrFail($id);
            $this->userRepository->update($data,$id);
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'users',
                'operated_row_id'   => $userLog->id,
                'previous_data'     => json_encode($userLog)
            ]);
            $user_info              = $this->userRepository->show($id);

            if($request->input('roles')){

                DB::table('users_roles')->where('user_id', $id)->delete();
                // DB::table('users_permissions')->where('user_id', $id)->delete();

                if(!is_array($roleIds = $request->input('roles'))){
                    $roleIds = explode(",", $request->input('roles'));
                }

                /* $userRoles              = $this->roleRepository->showMultiple($roleIds);

                foreach($userRoles as $userRole){
                    if (count($userRole->permissions) > 0){
                        foreach ($userRole->permissions as $aPermission){
                            $user_info->permissions()->attach($aPermission);
                        }
                    }
                } */

                foreach($roleIds as $roleId){
                    $user_info->roles()->attach($roleId);
                }

            }

            if($request->hasFile('image')) {

                $media              = Media::where('mediable_id', $id)->first();

                if (isset($media)){
                    $fileName       = basename(parse_url($media->url, PHP_URL_PATH));
                    if(file_exists('avatar/'.$fileName)){
                        unlink('avatar/'.$fileName);
                    }
                    //  $media->delete();
                }
                $imageUrl           = Helper::fileUpload("avatar/", $request->image);

                if(count($user_info->media()->get())){
                    // Update
                    $user_info->media()->update([

                        'url'           => $imageUrl

                    ]);
                }else{
                    // create new
                    $user_info->media()->create([

                        'url'           => $imageUrl

                    ]);
                }


                $user_info          = $this->userRepository->show($id);
            }

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          =>config('status.status_code.424'),
                'errors'            => [$e->getMessage()]
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200'),
            'user_info'             => $user_info
        ]);
    }


    public function updatePassword($request,$id)
    {
        $user =Auth::user();
        $validator = Validator::make($request->all(),[
            'current_password' => [
                'required',

                function ($attribute, $value, $fail) use ($user) {
                    if (!Hash::check($value, $user->password)) {
                        $fail('Your password was not updated, since the provided current password does not match.');
                    }
                }
            ],
            'password' => 'required|between:6,32|same:confirm_password',

        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code' => 400,
                'messages'    => config('status.status_code.400'),
                'errors'      => $validator->errors()->all()
            ]);

        }

        $input['password'] = Hash::make($request->password);

        DB::beginTransaction();

        try {

            $this->userRepository->updatePassword($input,$id);

        } catch (Exception $e) {

            DB::rollBack();

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code'   => 424,
                'messages'      => config('status.status_code.424'),
                'error'         => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json(['status_code' => 200, 'messages'=>config('status.status_code.200')]);
    }

    public function updateItem_backup($request,$id)
    {

        $rules = [
            'first_name'            => 'required|string|max:50|min:2',
            'last_name'             => 'required|string|max:50|min:2',
            'username'              => "required|string|max:50|min:4|unique:users,username,$id,id",
            'email'                 => "required|string|max:60|unique:users,email,$id,id",
            'mobile'                => "required|string|max:50|min:8|unique:users,mobile,$id,id"
        ];

        $validator = Validator::make($request->all(), $rules);

        if($validator->fails()) {

            return response()->json([
                'status'            => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            =>  $validator->errors()->all()
            ]);

        }

        $data                       = $request->all();

        if (isset($data['first_name'])){
            $data['slug']           = Helper::slugifyFullName($request->first_name,$request->middle_name,$request->last_name);
        }

        DB::beginTransaction();

        try{
            $userLog = UserDetail::leftJoin('users', 'user_details.id', '=', 'users.id')->findOrFail($id);
            $this->userRepository->update($data,$id);
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'users',
                'operated_row_id'   => $userLog->id,
                'previous_data'     => json_encode($userLog)
            ]);
            $user_info              = $this->userRepository->show($id);

            if($request->input('roles')){

                DB::table('users_roles')->where('user_id', $id)->delete();
                // DB::table('users_permissions')->where('user_id', $id)->delete();

                if(!is_array($roleIds = $request->input('roles'))){
                    $roleIds = explode(",", $request->input('roles'));
                }

                /* $userRoles              = $this->roleRepository->showMultiple($roleIds);

                foreach($userRoles as $userRole){
                    if (count($userRole->permissions) > 0){
                        foreach ($userRole->permissions as $aPermission){
                            $user_info->permissions()->attach($aPermission);
                        }
                    }
                } */

                foreach($roleIds as $roleId){
                    $user_info->roles()->attach($roleId);
                }

            }

            if($request->hasFile('image')) {

                $media              = Media::where('mediable_id', $id)->first();

                if (isset($media)){
                    $fileName       = basename(parse_url($media->url, PHP_URL_PATH));
                    if(file_exists('uploads/avatar/'.$fileName)){
                        unlink('uploads/avatar/'.$fileName);
                    }
                    //  $media->delete();
                }
                $imageUrl           = Helper::fileUpload("uploads/avatar/", $request->image);

                if(count($user_info->media()->get())){
                    // Update
                    $user_info->media()->update([

                        'url'           => $imageUrl

                    ]);
                }else{
                    // create new
                    $user_info->media()->create([

                        'url'           => $imageUrl

                    ]);
                }


                $user_info          = $this->userRepository->show($id);
            }

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
            'user_info'             => $user_info
        ]);
    }

    public function deleteItem($id)
    {

        DB::beginTransaction();

        try{
            DB::table('users_roles')->where('user_id', $id)->delete();
            DB::table('users_permissions')->where('user_id', $id)->delete();
            $this->userRepository->delete($id);
            DB::table('users_roles')->where('user_id', $id)->delete();

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
                $this->userRepository->changeItemStatus($data, $id);
            }
            $user_info              = $this->userRepository->show($id);

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
            'user_info'             => $user_info
        ]);

    }

    public function checkUniqueIdentity($request)
    {
        $data                       = $request->all();

        DB::beginTransaction();

        try{

            if (isset($data['username'])){
                $user_info          = $this->userRepository->checkUserName($data);
            }
            if (isset($data['email'])){
                $user_info          = $this->userRepository->checkUserEmail($data);
            }
            if (isset($data['mobile'])){
                $user_info          = $this->userRepository->checkUserMobile($data);
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

        if (count($user_info) == 0){
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

    public function storeSpecialPermissions($request, $id){

        $allPermissions =  $request->all();

        DB::beginTransaction();

        try{
            DB::table('users_permissions')->where('user_id', $id)->delete();

            foreach($allPermissions as $permissions){
                foreach($permissions['permissions'] as  $permission){
                    if(!$permission['isRoleBasePermission'] && $permission['isPermissionGiven']){
                        $this->userRepository->storeUserPermissions($id, $permission['id']);
                    }
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
            'message'               => config('status.status_code.200')
        ]);


    }

    public function getSpecialPermissions($id){

        DB::beginTransaction();

        try{

            $userPermissions                = $this->userRepository->getSpecialPermissions($id);

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
            'userPermissions'       => $userPermissions
        ]);
    }

    public function getUsersByRoleName($roleName){

        try{

            $users                  = $this->userRepository->getUsersByRoleName($roleName);

        }catch (Exception $e) {

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200'),
            'users'                 => $users
        ]);
    }

    public function searchUserList($request){
        try{

            $users                  = $this->userRepository->searchUserList($request);

        }catch (Exception $e) {

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200'),
            'listing'               => $users
        ]);
    }

    public function checkCustomerExist($request){
        try{

            $result  = $this->userRepository->checkCustomerExist($request);

        }catch (Exception $e) {

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        return response()->json([
            'status'             => 200,
            'messages'           => config('status.status_code.200'),
            'data'               => $result
        ]);
    }
}

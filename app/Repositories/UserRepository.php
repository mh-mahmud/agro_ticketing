<?php
namespace App\Repositories;

use App\Http\Traits\QueryTrait;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\UsersPermission;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserRepository
{
    use QueryTrait;

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        
        $query = self::whereQueryFilter($request, $query, $whereFilterList);
        $query = self::likeQueryFilter($request, $query, $likeFilterList);

        return $query;

    }

    public function listing($request)
    {
        
        $field = $request->all();
        $query = User::leftJoin('user_details', 'users.id', '=', 'user_details.id')->select('user_details.*', 'users.username', 'users.status')->with('media','roles.permissions', 'permissions', 'groups');

        $whereFilterList = ['first_name','last_name','email','phone'];
        $likeFilterList  = ['first_name','last_name','email','phone'];

        if (array_key_exists("query",$field) && !empty($request->query))
        {

            $query->where('first_name', '=' ,$field['query'])
                ->orWhere('last_name', '=' ,$field['query'])
                ->orWhere('email', '=' ,$field['query'])
                ->orWhere('mobile', '=' ,$field['query'])
                ->orWhere('first_name','like', '%' . $field['query'] . '%')
                ->orWhere('last_name','like', '%' . $field['query'] . '%')
                ->orWhere('email','like', '%' . $field['query'] . '%')
                ->orWhere('mobile','like', '%' . $field['query'] . '%')
                ->orWhereHas('roles', function ($q) use ($field){
                    $q->where('name', '=' ,$field['query'])->orWhere('name', 'like', '%'.$field['query'].'%');
                });

        }

        $query->orderBy('users.created_at','DESC');
        return $query->paginate(config('others.ROW_PER_PAGE'));

    }

    public function listingNonUser($request)
    {
        
        return UserDetail::with('media','roles.permissions', 'permissions', 'groups')
                            ->orderBy('user_details.created_at','DESC')
                            ->paginate(config('others.ROW_PER_PAGE'));

    }

    public function show($id)
    {

        return UserDetail::leftJoin('users', 'users.id', '=', 'user_details.id')->with('media','roles.permissions', 'permissions','groups')->findorfail($id);

    }

    public function create(array  $data)
    {
        $userDetail                 = new UserDetail();
        $userDetail->id             = $data['id'];
        $userDetail->first_name     = $data['first_name'];
        $userDetail->middle_name    = $data['middle_name'] ?? null;
        $userDetail->last_name      = $data['last_name'] ?? null;
        $userDetail->mobile         = $data['mobile'];
        $userDetail->account_no     = $data['account_no'] ?? null;
        $userDetail->card_no        = $data['card_no'] ?? null;
        $userDetail->cif_id         = $data['cif_id'] ?? null;
        $userDetail->slug           = $data['slug'];
        $userDetail->address        = $data['address'] ?? null;
        $userDetail->email          = $data['email'] ?? null;
        $userDetail->customer_type  = $data['customer_type'] ?? null;
        $userDetail->updated_at     = Carbon::now()->timestamp;
        $userDetail->save();

        //Create User
        if( array_key_exists('username', $data) && array_key_exists('password', $data) ){
            $this->createUser($data);
        }
        return $data['id'];
    }

    public function createUser(array  $data){
        $user                      = new User();
        $user->id                  = $data['id'];
        $user->username            = $data['username'];
        $user->password            = bcrypt($data['password']);
        isset($data['status']) ? $user->status = $data['status'] : null;
        $user->created_at          = Carbon::now()->timestamp;
        $user->updated_at          = Carbon::now()->timestamp;
        $user->save();
    }

    public function update(array $data, $id)
    {
        $data['id'] = $id;
        // Update user detail
        $userDetail                = UserDetail::findorfail($id);
        $userDetail->first_name    = $data['first_name'] ?? $userDetail->first_name;
        $userDetail->middle_name   = $data['middle_name'];
        $userDetail->last_name     = $data['last_name'] ?? $userDetail->last_name;
        $userDetail->account_no    = isset($data['account_no']) ? $data['account_no'] : $userDetail->account_no;
        $userDetail->card_no       = isset($data['card_no']) ? $data['card_no'] : $userDetail->card_no;
        $userDetail->cif_id        = isset($data['cif_id']) ? $data['cif_id'] : $userDetail->cif_id;
        $userDetail->slug          = $data['slug'];
        $userDetail->email         = $data['email'] ?? $userDetail->email;
        $userDetail->mobile        = $data['mobile'] ?? $userDetail->mobile;
        $userDetail->address       = $data['address'];
        $userDetail->updated_at    = Carbon::now()->timestamp;
        $userDetail->save();
        
        // Update user
        if( array_key_exists('username', $data) && $user = User::find($id) ){
            $user->username            = $data['username'] ?? $user->username;
            $user->password            = !empty($data['password']) ? Hash::make($data['password']) : $user->password;
            isset($data['status']) ? $user->status = $data['status'] : null;
            $user->updated_at          = Carbon::now()->timestamp;
            $user->save();
        }else{
            $this->createUser($data);
        }
        return $userDetail;
    }

    public function delete($id)
    {

        UserDetail::findorfail($id)->delete();// Delete user detail first
        if(User::find($id)){
            User::findorfail($id)->delete();
            return true;
        }

        // Dont unlink file for soft delete

        /* if (count((array)$user->media) > 0){
            // foreach ($user->media as $aFile)
            // {
            $fileName = basename(parse_url($user->media->url, PHP_URL_PATH));
            if(file_exists('uploads/avatar/'.$fileName)){
                unlink('uploads/avatar/'.$fileName);
            }
            $user->media->delete();
            // }
        } */
        // return $user->delete();
    }

    public function updatePassword(array $data, $id){
        $dataObj = User::findorfail($id);
        if ($data['password']){
            $dataObj->password = $data['password'];
        }
        return $dataObj->save();
    }

    public function changeItemStatus(array $data, $id)
    {

        $user           = User::findorfail($id);
        $user->status   = isset($data['status']) ? $data['status'] : $user->status;
        $user->save();
        return $user;
    }

    public function checkUserName(array $data){
        $user = User::join('user_details', 'users.id', '=', 'user_details.id')->where('username',$data['username'])->get();
        return $user;
    }

    public function checkUserEmail(array $data){
        $user = User::join('user_details', 'users.id', '=', 'user_details.id')->where('email',$data['email'])->get();
        return $user;
    }

    public function checkUserMobile(array $data){
        $user = User::join('user_details', 'users.id', '=', 'user_details.id')->where('mobile',$data['mobile'])->get();
        return $user;
    }

    public function storeUserPermissions($id, $permission_id){
        DB::table('users_permissions')->insert([
            'user_id'       => $id,
            'permission_id' => $permission_id
        ]);
    }

    public function getSpecialPermissions($id){
        return UsersPermission::where('user_id', $id)->get();
    }

    public function getUsersByRoleName($roleName){
        return User::with('media')
            ->rightjoin('user_details', 'users.id', '=', 'user_details.id')
            ->join('users_roles', 'users_roles.user_id', '=', 'users.id')
            ->join('roles', 'roles.id', '=', 'users_roles.role_id')
            ->select(
                'user_details.id',
                'user_details.email',
                'user_details.slug',
                DB::raw("CONCAT(user_details.first_name, IF(user_details.middle_name IS NULL, ' ', user_details.middle_name), user_details.last_name) AS full_name")
            )
            ->where('roles.slug', $roleName)
            ->get();
    }

    public function searchUserList($request){
        if ($request->filled('query'))
        {
            return DB::table('users')
                ->rightJoin('user_details', 'users.id', '=', 'user_details.id')
                ->select(
                    'user_details.id',
                    'first_name',
                    'middle_name',
                    'last_name',
                    'email',
                    'mobile'
                )
                ->where('first_name','LIKE','%' . $request['query'] . '%')
                ->orWhere('middle_name','LIKE','%' . $request['query'] . '%')
                ->orWhere('last_name','LIKE','%' . $request['query'] . '%')
                // ->orWhere('email','LIKE','%' . $request['query'] . '%')
                ->orWhere('mobile','LIKE','%' . $request['query'] . '%')
                ->get();
        }
    }

    public function checkCustomerExist($request){
        $count = UserDetail::where('mobile', $request["mobile_no"])
                            ->count();
        return $count;
    }
}

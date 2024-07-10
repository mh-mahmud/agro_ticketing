<?php

namespace App\Services\Crm;

use App\Helpers\Helper;
use DB;
use Illuminate\Support\Facades\Hash;

class CrmAuthService
{
    public function isAuthentic($userName, $password){
        if($user = DB::table('api_users')
                    ->join('users', 'users.id', '=', 'api_users.user_id')
                    ->where('users.username', $userName)->first()
        ){
            if(Hash::check($password, $user->password)){
                // Authentic user
                return $user;
            }
        }
        return false;
    }
}
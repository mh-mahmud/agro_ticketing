<?php
namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\UserDetail;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Str;
use App\Helpers\Helper;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
       // User::truncate();
        $userPermission = Permission::all();
        $userRole = Role::where('slug', 'admin')->first();

        DB::table('users')->truncate();
        DB::table('media')->truncate();
        DB::table('users_roles')->truncate();
        DB::table('roles_permissions')->truncate();
        DB::table('users_permissions')->truncate();

        $userRole->permissions()->attach($userPermission);

        $user = User::where('username', 'admin')->first();

        if(!$user){

            User::create([
                'id'                => Helper::idGenarator(),
                'username'          => 'admin',
                'password'          => bcrypt('123456'),
                'status'            => 1,
                'email_verified_at' => now(),
                'remember_token'    => Str::random(10),
                'created_at'        => Carbon::now()->timestamp,
                'updated_at'        => Carbon::now()->timestamp,
            ]);

            // Create crm api user
            $userId = Helper::idGenarator();
            User::create([
                'id'                => $userId,
                'username'          => 'crm_api_user',
                'password'          => bcrypt('1234'),
                'status'            => 1,
                'email_verified_at' => now(),
                'remember_token'    => Str::random(10),
                'created_at'        => Carbon::now()->timestamp,
                'updated_at'        => Carbon::now()->timestamp,
            ]);

            UserDetail::create([
                'id' => $userId,
                'first_name' => 'Crm Api User',
                'last_name'  => 'Crm Api User',
                'mobile'     => '1234567890',
                'slug'       => 'crm-api-user',
                'email'      => 'crm.user@testmail.test',
                'created_at' => Carbon::now()->timestamp,
                'updated_at' => Carbon::now()->timestamp,
            ]);

            $user = User::where('username', 'admin')->first();
            $user->roles()->attach($userRole);

            $user = User::where('username', 'crm_api_user')->first();
            $user->roles()->attach($userRole);
            DB::table('api_users')->insert([
                'user_id' => $user->id
            ]);
        }

        Schema::enableForeignKeyConstraints();

    }
}

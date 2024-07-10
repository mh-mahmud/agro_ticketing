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

class BulkUserTableSeeder extends Seeder
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

        DB::table('roles_permissions')->truncate();
        DB::table('users_permissions')->truncate();

        $userRole->permissions()->attach($userPermission);

        for($i=0; $i<=5; $i++){
            $first_name = Str::random(5);
            $last_name = Str::random(5);
            // $userId = time().rand(1000,9000);
            $userId = Helper::idGenarator();

            $userDetail = UserDetail::create([
                'id' => $userId,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'mobile' => Helper::idGenarator(),
                'slug' => $first_name . "-" . $last_name,
                'email' => $first_name . $last_name . '@genusys.us',
                'created_at' => Carbon::now()->timestamp,
                'updated_at' => Carbon::now()->timestamp,
            ]);

            $user = User::create([
                'id' => $userId,
                'username' => $first_name . "-" . $last_name,
                'password' => bcrypt('123456'),
                'status' => 1,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
                'created_at' => Carbon::now()->timestamp,
                'updated_at' => Carbon::now()->timestamp,
            ]);

            $user = User::where('username', $first_name . "-" . $last_name)->first();

            $user->roles()->attach($userRole);
            /* $user->media()->create([
               'url' => url('/').'/public/avatar/placeholder.png'
                // 'url' => url('/').'/office-project/ticketingSystem/public/avatar/placeholder.png'
            ]); */
        }


        // $user->permissions()->attach($userPermission);

        Schema::enableForeignKeyConstraints();

    }
}

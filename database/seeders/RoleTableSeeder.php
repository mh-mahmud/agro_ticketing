<?php
namespace Database\Seeders;

use App\Helpers\Helper;
use App\Models\Role;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class RoleTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Role::truncate();

        $roles = [
            'Super Admin',
            'Admin',
            'Supervisor',
            'Agent',
            'User',
        ];


        foreach ($roles as $role) {

            Role::Create(
                [
                    'name' => $role,
                    'slug' => Helper::slugify($role),
                    'status' => 1,
                    'details' => '',
                    'created_at' => Carbon::now()->timestamp,
                    'updated_at' => Carbon::now()->timestamp,
                ]);

        }

        Schema::enableForeignKeyConstraints();
    }
}

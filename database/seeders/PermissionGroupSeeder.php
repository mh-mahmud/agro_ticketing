<?php
namespace Database\Seeders;

use App\Helpers\Helper;
use App\Models\PermissionGroup;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class PermissionGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
       PermissionGroup::truncate();

        $groups = [
            'Admin',
            'User',
            'Permission',
            'Role',
            'Priority',
            'Status',
            'Group',
            'Question',
            'Business Hour',
            'Holiday',
            'Canned Message',
            'Type',
            'Source',
            'CRM Skill Role',
            // 'Tag',
            'Ticket',
            // 'Message',
            'Notification',
            'Report'
        ];


        foreach ($groups as $group) {

            PermissionGroup::Create([
                'name' => $group,
                'slug' => Helper::slugify($group),
                'created_at' => Carbon::now()->timestamp,
                'updated_at' => Carbon::now()->timestamp,
            ]);

        }

        Schema::enableForeignKeyConstraints();
    }
}

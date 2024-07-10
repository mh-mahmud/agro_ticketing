<?php

namespace Database\Seeders;

use App\Models\Group;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Helpers\Helper;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Group::truncate();

            $groups = [
                'Accounts',
                'Sales',
                'Billing',
                'Procurement',
                'QA',
                'Support'
            ];


            foreach ($groups as $group) {

                Group::Create([
                    'name' => $group,
                    'slug' => Helper::slugify($group),
                    'parent_id'=>0,
                    'created_at' => Carbon::now()->timestamp,
                    'updated_at' => Carbon::now()->timestamp,
                ]);

            }

            Schema::enableForeignKeyConstraints();
    }
}

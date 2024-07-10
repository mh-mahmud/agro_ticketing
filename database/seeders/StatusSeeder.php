<?php

namespace Database\Seeders;

use App\Helpers\Helper;
use App\Models\Status;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();

        Status::truncate();

        $statuses = [
            'Open',
            'Pending',
            'Resolved',
            'Closed'
        ];

        foreach ($statuses as $status)
        {
            Status::Create([
                'name' => $status,
                'slug' => Helper::slugify($status),
                'created_at' => Carbon::now()->timestamp,
                'updated_at' => Carbon::now()->timestamp,
            ]);
        }

        Schema::enableForeignKeyConstraints();
    }
}

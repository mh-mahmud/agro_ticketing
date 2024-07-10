<?php

namespace Database\Seeders;

use App\Helpers\Helper;
use App\Models\Priority;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Str;

class PrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();

        Priority::truncate();

        $priorities = [
            'High',
            'Low',
            'Medium'
        ];

        foreach ($priorities as $priority)
        {
            Priority::Create([
                'name' => $priority,
                'slug' => Helper::slugify($priority),
                'created_at' => Carbon::now()->timestamp,
                'updated_at' => Carbon::now()->timestamp,
            ]);
        }

        Schema::enableForeignKeyConstraints();
    }
}

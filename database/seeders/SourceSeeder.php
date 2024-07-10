<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use App\Models\Source;
use App\Helpers\Helper;
use Illuminate\Support\Facades\Schema;

class SourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();

        Source::truncate();

        $sources = [
            'Phone',
            'Email',
            'Forum',
            'Facebook'
        ];

        foreach ($sources as $source)
        {
            Source::Create([
                'name' => $source,
                'slug' => Helper::slugify($source),
                'parent_id' => 0,
                'created_at' => Carbon::now()->timestamp,
                'updated_at' => Carbon::now()->timestamp
            ]);
        }

        Schema::enableForeignKeyConstraints();
    }
}

<?php

namespace Database\Seeders;

use App\Models\Tag;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Helpers\Helper;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Tag::truncate();

            $tags = [
                'Label your tickets',
                'articles',
                'Problem',
                'Feature Request',
                'Refund',
                'Return',
                'Bulk Order'
            ];

            foreach ($tags as $tag) {

                Tag::Create([
                    'name' => $tag,
                    'slug' => Helper::slugify($tag),
                    'created_at' => Carbon::now()->timestamp,
                    'updated_at' => Carbon::now()->timestamp,
                    ]);

            }

            Schema::enableForeignKeyConstraints();
    }
}

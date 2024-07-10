<?php

namespace Database\Seeders;

use App\Models\Type;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Helpers\Helper;

class TypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Type::truncate();

        $types = [
            'Question',
            'Incident',
            'Problem',
            'Feature Request',
            'Refund',
            'Return',
            'Bulk Order'
        ];


        foreach ($types as $type) {

            Type::Create([
                'name'  => $type,
                'slug'  => Helper::slugify($type),
                'day'   => 0,
                'hour'  => 0,
                'min'   => 0,
                'created_at' => Carbon::now()->timestamp,
                'updated_at' => Carbon::now()->timestamp,
            ]);

        }

        Schema::enableForeignKeyConstraints();
    }
}

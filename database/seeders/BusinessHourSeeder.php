<?php

namespace Database\Seeders;

use App\Helpers\Helper;
use App\Models\BusinessHour;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Str;

class BusinessHourSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        /* Schema::disableForeignKeyConstraints();
        BusinessHour::truncate();

        for($i=0; $i<=50; $i++){
            $id = Helper::idGenarator();
            $name = Str::random(5).' '.Str::random(5);


            BusinessHour::create([
                'id' => $id,
                'name' => $name,
                'slug' => Helper::slugify($name),
                'description' => '',
                'status' => 1,
                'time_zone_id' => 254,
                'created_at' => Carbon::now()->timestamp,
                'updated_at' => Carbon::now()->timestamp,
            ]);
        }

        Schema::enableForeignKeyConstraints(); */
    }
}

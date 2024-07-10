<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HolidaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $date = date('Y-m-d H:i:s');
        DB::table('holidays')->truncate();
        DB::table('holidays')->insert([
            [
                'name'  =>  'International Mother Language Day',
                'date'  =>  '2022-01-21',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Sheikh Mujibur Rahman\'s Birthday',
                'date'  =>  '2022-03-17',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Shab e-Barat',
                'date'  =>  '2022-03-18',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Independence Day',
                'date'  =>  '2022-03-26',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Bengali New Year',
                'date'  =>  '2022-04-14',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Laylat al-Qadr',
                'date'  =>  '2022-04-28',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Jumatul Bidah',
                'date'  =>  '2022-04-29',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'May Day',
                'date'  =>  '2022-05-01',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Eid ul-Fitr Holiday',
                'date'  =>  '2022-05-02',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Eid ul-Fitr',
                'date'  =>  '2022-05-03',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Eid ul-Fitr Holiday',
                'date'  =>  '2022-05-04',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Buddha Purnima',
                'date'  =>  '2022-05-16',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Eid ul-Adha Holiday',
                'date'  =>  '2022-07-09',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Eid ul-Adha',
                'date'  =>  '2022-07-10',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Eid ul-Adha Holiday',
                'date'  =>  '2022-07-11',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Ashura',
                'date'  =>  '2022-08-09',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'National Mourning Day',
                'date'  =>  '2022-07-15',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Shuba Janmashtami',
                'date'  =>  '2022-07-19',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Vijaya Dashami',
                'date'  =>  '2022-10-05',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Eid-e-Milad un-Nabi',
                'date'  =>  '2022-10-09',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Victory Day',
                'date'  =>  '2022-12-16',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ],
            [
                'name'  =>  'Christmas Day',
                'date'  =>  '2022-12-25',
                'created_at'  =>  $date,
                'updated_at'  =>  $date
            ]
        ]);
    }
}

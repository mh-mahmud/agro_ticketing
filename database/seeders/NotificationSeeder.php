<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Helpers\Helper;
use App\Models\Notification;
use Str;
use DB;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        DB::table('notifications')->truncate();
        $tickets = DB::table('tickets')->select('id')->get()->pluck('id')->toArray();
       
        for($i=0; $i<=50; $i++){
            $id = Helper::idGenarator();
          
            $notification = Notification::create([
                'id' => $id,
                'ticket_id' =>$tickets[array_rand($tickets, 1)],
                'note' => Str::random(10),
                
            ]);

            
        }

            Schema::enableForeignKeyConstraints();
    }
}

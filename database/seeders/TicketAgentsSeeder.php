<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Helpers\Helper;

class TicketAgentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        $tickets = DB::table('tickets')->select('id')->get();

        $userIds = DB::table('users')->select('id')->get()->pluck('id')->toArray();

        foreach($tickets as $ticket){
            DB::table('tickets_agents')->insert([
                'id'        => Helper::idGenarator(),
                'ticket_id' => $ticket->id,
                'user_id'   => $userIds[array_rand($userIds, 1)]
            ]);
        }
        
        Schema::enableForeignKeyConstraints();
    }
}

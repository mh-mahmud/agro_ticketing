<?php
namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\Message;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Str;
use App\Helpers\Helper;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        DB::table('tickets')->truncate();
        DB::table('messages')->truncate();

        $userIds = DB::table('users')->select('id')->get()->pluck('id')->toArray();
        
        for($i = 1; $i <= 50; $i ++){
            $ticketId = Helper::idGenarator();
            $ticket = Ticket::create([
                'id'            => $ticketId,
                'subject'       => Str::random(20),
                'contact_id'    => $userIds[array_rand($userIds, 1)],
                'account_no'    => Str::random(20),
                'card_no'       => Str::random(20),
                'cif_id'        => Str::random(20),
                'type_id'       => rand(1,7),
                'status_id'     => rand(1,4),
                'priority_id'   => rand(1,3),
                'group_id'      => rand(1,6),
                'source_id'     => rand(1,3),
                'tag_id'        => rand(1,3),
                'description'   => Str::random(50),
                'approved_by'   => $userIds[array_rand($userIds, 1)],
                'created_by'    => $userIds[0],
                'created_at'    => Carbon::now()->timestamp,
                'updated_at'    => Carbon::now()->timestamp,
            ]);

            // Reply
            $totalReply = rand(1,10);
            for($j = 1; $j <= $totalReply; $j++){
                $message = Message::create([
                    'id'        => Helper::idGenarator(),
                    'ticket_id' => $ticketId,
                    'replied_by'=> $userIds[array_rand($userIds, 1)],
                    'message'   => Str::random(rand(15, 60)),
                    'created_at' => Carbon::now()->timestamp,
                    'updated_at' => Carbon::now()->timestamp,
                ]);
            }
        }
        Schema::enableForeignKeyConstraints();

    }
}

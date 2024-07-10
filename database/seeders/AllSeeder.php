<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AllSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call([

            PermissionGroupSeeder::class,
            PermissionTableSeeder::class,
            RoleTableSeeder::class,
            UserTableSeeder::class,
            BulkUserTableSeeder::class,
            PrioritySeeder::class,
            StatusSeeder::class,
            BusinessHourSeeder::class,
            TypeSeeder::class,
            GroupSeeder::class,
            TicketSeeder::class,
            TimezoneSeeder::class,
            SourceSeeder::class,
            //NotificationSeeder::class,
            //TicketAgentsSeeder::class,
            HolidaySeeder::class
        ]);
    }
}

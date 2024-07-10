<?php
namespace Database\Seeders;

use App\Helpers\Helper;
use App\Models\Permission;
use App\Models\PermissionGroup;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Permission::truncate();

        $group_and_permission = [
            'admin' => [
                'Admin Panel'
            ],
            'user' => [
                'User List',
                'User Create',
                'User Edit',
                'User Delete',
            ],
            'permission' => [
                'Permission List',
                'Permission Create',
                'Permission Edit',
                'Permission Delete'
            ],
            'role' => [
                'Role List',
                'Role Create',
                'Role Edit',
                'Role Delete'
            ],
            'priority' => [
                'Priority List',
                'Priority Create',
                'Priority Edit',
                'Priority Delete'
            ],
            'status' => [
                'Status List',
                'Status Create',
                'Status Edit',
                'Status Delete'
            ],
            'group' => [
                'Group List',
                'Group Create',
                'Group Edit',
                'Group Delete'
            ],
            'question' => [
                'Question List',
                'Question Create',
                'Question Edit',
                'Question Delete'
            ],
            'business-hour' => [
                'Business Hour List',
                'Business Hour Create',
                'Business Hour Edit',
                'Business Hour Delete'
            ],
            'holiday' => [
                'Holiday List',
                'Holiday Create',
                'Holiday Edit',
                'Holiday Delete'
            ],
            'canned-message' => [
                'Canned Message List',
                'Canned Message Create',
                'Canned Message Edit',
                'Canned Message Delete'
            ],
            'type' => [
                'Type List',
                'Type Create',
                'Type Edit',
                'Type Delete'
            ],
            'source' => [
                'Source List',
                'Source Create',
                'Source Edit',
                'Source Delete'
            ],
            'crm-skill-role' => [
                'CRM Skill Role List',
                'CRM Skill Role Create',
                'CRM Skill Role Edit',
                'CRM Skill Role Delete'
            ],
            'ticket' => [
                'Ticket List',
                'Can See All Ticket',
                'Ticket Create',
                'Ticket Edit',
                'Ticket Delete',
                'Ticket Reply',
                'Ticket Approval',
                'Reopen Ticket',
                'Ticket Forward',
                'Change Ticket Status'
            ],
            /* 'tag' => [
                'Tag List',
                'Tag Create',
                'Tag Edit',
                'Tag Delete'
            ], */
            /* 'message' => [
                'Message List',
                'Message Create',
                'Message Edit',
                'Message Delete'
            ], */
            'notification' =>[
                // 'All Notification', // It will be create problem when try to notification delete
                'Notification Delete'
            ],
            'report' =>[
                // 'All Notification', // It will be create problem when try to notification delete
                'Source Report',
                'Type Report',
                'Group Report',
                'Status Report'
            ]
        ];


        foreach ($group_and_permission as $group => $Permissions) {

            if($id = PermissionGroup::where('slug', $group)->first()->id){
                foreach($Permissions as $Permission){
                    Permission::Create([
                        'permission_group_id'=>$id,
                        'name' => $Permission, 'slug' => Helper::slugify($Permission),
                        'created_at' => Carbon::now()->timestamp,
                        'updated_at' => Carbon::now()->timestamp,
                    ]);
                }
            }

        }

        Schema::enableForeignKeyConstraints();
    }
}

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PriorityController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\PermissionGroupController;
use App\Http\Controllers\Api\BusinessHourController;
use App\Http\Controllers\Api\TimezoneController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\Holiday2Controller;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\TimeSlotController;
use App\Http\Controllers\Api\CannedMessageController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\TypeController;
use App\Http\Controllers\Api\SubTypeController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\SourceController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketForwardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\Report\SourceReportController;
use App\Http\Controllers\Api\Report\TypeReportController;
use App\Http\Controllers\Api\Report\GroupReportController;
use App\Http\Controllers\Api\Report\StatusReportController;
use App\Http\Controllers\Api\Crm\CrmSkillRoleController;
use App\Http\Controllers\Api\Crm\CrmApiController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\TicketingSystemAPI;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

//Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//    return $request->user();
//});
// Route::apiResource('holidays2',              Holiday2Controller::class);

Route::middleware('auth:api')->group(function(){

    /* Report */
    Route::apiResource('report',                ReportController::class);
    Route::apiResource('dashboard',             DashboardController::class);
    Route::get('sourceReportDateWise',          [SourceReportController::class, 'dateWiseReport']);
    Route::get('typeReportDateWise',            [TypeReportController::class, 'dateWiseReport']);
    Route::get('groupReportDateWise',           [GroupReportController::class, 'dateWiseReport']);
    Route::get('statusReportDateWise',          [StatusReportController::class, 'dateWiseReport']);
    /* End Report */

    /* Download Report */
    Route::get('sourceReportDateWiseDownload/csv',      [SourceReportController::class, 'dateWiseReportDownloadCsv']);
    Route::get('typeReportDateWiseDownload/csv',        [TypeReportController::class, 'dateWiseReportDownloadCsv']);
    Route::get('groupReportDateWiseDownload/csv',       [GroupReportController::class, 'dateWiseReportDownloadCsv']);
    Route::get('statusReportDateWiseDownload/csv',      [StatusReportController::class, 'dateWiseReportDownloadCsv']);
    /* End Download Report */

    Route::apiResource('users',                 UserController::class);
    Route::post('user/updateOwnProfile/{id}',   [UserController::class, 'updateOwnProfile']);
    Route::post('user/change-password/{id}',    [UserController::class, 'changePassword']);
    Route::post('user/status/{id}',             [UserController::class, 'changeItemStatus']);
    Route::post('user/unique-info',             [UserController::class, 'checkUniqeInfo']);
    Route::post('user/specialPermissions/{id}', [UserController::class, 'storeSpecialPermissions']);
    Route::get('user/specialPermissions/{id}',  [UserController::class, 'getSpecialPermissions']);
    Route::get('user/showOwnData/{id}',         [UserController::class, 'showOwnData']);
    Route::get('user/{id}',                     [UserController::class, 'show']);
    Route::get('user/getByRole/{roleName}',     [UserController::class, 'getUsersByRoleName']);
    Route::post('user/logout',                  [UserController::class, 'logout']);
    //Route::post('user/email', [UserController::class, 'checkUserEmailExist']);
    Route::post('user/search',                  [UserController::class, 'searchUserList']);
    Route::get('check-user',                  [UserController::class, 'checkCustomerExist']);


    Route::apiResource('roles',                 RoleController::class);
    Route::get('getList/roles',                 [RoleController::class, 'getList']);

    Route::post('role/status/{id}',             [RoleController::class,'changeItemStatus']);
    Route::post('role/unique-info',             [RoleController::class, 'checkUniqeInfo']);

    Route::apiResource('permissions',           PermissionController::class);
    Route::get('getUserInfo',                   [PermissionController::class, 'getUserInfo']);
    Route::post('permission/unique-info',       [PermissionController::class, 'checkUniqeInfo']);

    Route::apiResource('permissionGroups',      PermissionGroupController::class);

    Route::apiResource('priorities',            PriorityController::class);
    Route::get('getList/priorities',            [PriorityController::class, 'getList']);

    Route::apiResource('statuses',              StatusController::class);
    Route::get('getList/statuses',              [StatusController::class, 'getList']);

    Route::apiResource('tickets',                   TicketController::class);
    Route::get('ticketsNeedToApprove',              [TicketController::class, 'ticketsNeedToApprove']);
    Route::get('ticket/approve/{id}',               [TicketController::class, 'approveTicket']);
    Route::put('ticket/updateFromReplySection/{id}',[TicketController::class, 'updateFromReplySection']);
    Route::put('ticket/reopen/{id}',                [TicketController::class, 'reopen']);
    Route::get('ticket/getWhoCanSeeTicket/{id}',    [TicketController::class, 'getWhoCanSeeTicket']);
    Route::get('ticketDownloadCsv',                 [TicketController::class, 'ticketDownloadCsv']);

    //content-upload
    Route::post('ticket/upload-files',              [TicketController::class, 'uploadTicketMedia']);

    Route::apiResource('business-hours',        BusinessHourController::class);

    Route::apiResource('holidays',              HolidayController::class);

    Route::get('getList/holidays',              [HolidayController::class, 'getList']);

    Route::apiResource('timezones',             TimezoneController::class);

    Route::apiResource('time-slots',            TimeSlotController::class);

    Route::apiResource('canned-messages',       CannedMessageController::class);

    Route::apiResource('questions',                 QuestionController::class);
    Route::get('getQuestionsByCategory/{catId}',    [QuestionController::class, 'getQuestionsByCategory']);

    Route::apiResource('types',                 TypeController::class);
    Route::get('getList/types',                 [TypeController::class, 'getList']);
    Route::get('getList/all-types',                 [TypeController::class, 'getAllTypes']);


    Route::apiResource('sub-types',             SubTypeController::class);
    Route::get('getList/sub-types/{parentId}',   [SubTypeController::class, 'getList']);

    Route::apiResource('tags',                  TagController::class);

    Route::apiResource('sources',               SourceController::class);
    Route::get('getList/sources',               [SourceController::class, 'getList']);

    Route::apiResource('groups',                GroupController::class);
    Route::get('getList/groups',                [GroupController::class, 'getList']);

    Route::apiResource('messages',              MessageController::class);
    Route::apiResource('ticket-forward',        TicketForwardController::class);
    Route::get('getAgentByGroup/{id}',          [GroupController::class, 'getAgentByGroup']);

    Route::apiResource('notifications',                 NotificationController::class);
    Route::delete('notifications',                      [NotificationController::class, 'bulkDestroy']);
    Route::post('notification/storeNoticeWithUsers',    [NotificationController::class, 'storeNoticeWithUsers']);
    Route::get('notification/newNotificationCount',     [NotificationController::class, 'newNotificationCount']);
    Route::get('notification/setNotificationToSeen',    [NotificationController::class, 'setNotificationToSeen']);

    /* CRM */
    Route::apiResource('crm/crm-skill-role',        CrmSkillRoleController::class);

});


/* CRM Api route */
Route::get('crm/get-ticket-list',        [CrmApiController::class, 'getTicketList']);
Route::post('crm/createUser',            [CrmApiController::class, 'createUser']);
Route::get('crm/get-auth-token',         [CrmApiController::class, 'getAuthToken']);
/* End CRM Api route */


Route::post('login',                            AuthController::class);




/* This is for testing purpose */
/* Route::get("crm", function(){

    $apiObj = new TicketingSystemAPI();

    $mobileNumber   = !empty($_REQUEST['CLI']) ? substr($_REQUEST['CLI'], -11) : "";
    $customerId     = !empty($_REQUEST['CID']) ? $_REQUEST['CID'] : "";
    $customerAcc    = !empty($_REQUEST['ACC']) ? $_REQUEST['ACC'] : "";
    $ticket_id      = !empty($_REQUEST['TICKET_ID']) ? $_REQUEST['TICKET_ID'] : "";
    $token          = !empty($_REQUEST['TOKEN']) ? $_REQUEST['TOKEN'] : "";
    $type           = !empty($_REQUEST['TYPE']) ? strtoupper($_REQUEST['TYPE']) : "";
    
    //Get ticket list by mobile number
    if($mobileNumber != '' && $type == "TICKET_LIST_BY_MOBILE"){
    
        echo $apiObj->getTicketListByMobile("crm/get-ticket-list", ['mobile' => $mobileNumber]);
    
    }
    
    if($ticket_id != '' && $type == "TICKET_REPLY"){
    
        echo $apiObj->getTicketReplyIframe($ticket_id);
    
    }
    
    if($type == "TICKET_CREATE_BUTTON"){
    
        echo json_encode([['create_ticket'=>'Create Ticket']]);
    
    }
    
    if($type == "GET_AGENT_INFO"){
        
        echo $apiObj->getAgentInfo();
    
    }
    
    if($type == "TICKET_CREATE"){
        
        if( !empty($mobileNumber) ){
            $apiObj->storeCustomerInfo($mobileNumber);
        }
    
        echo $apiObj->getTicketCreateIframe($mobileNumber);
    
    }
    
    if($type == "STORE_CUSTOMER"){

        if( !empty($mobileNumber) ){
            $res = $apiObj->storeCustomerInfo($mobileNumber);
            if( is_array($res) && array_key_exists('status', $res) && $res['status'] == 200 ){
                echo json_encode($res);
                return;
            }
        }
        echo json_encode($res);
        return;
    }

    if($type == "GET_ACCOUNT_BY_ID"){

        if( !empty($customerId) ){
            $res = $apiObj->getAccountInfoByCid($customerId);
            if( is_array($res) && array_key_exists('status', $res) && $res['status'] == 200 ){
                echo json_encode($res);
                return;
            }
        }
        echo json_encode($res);
        return;
    }

    if($type == "GET_CARD_BY_ID"){

        if( !empty($customerId) ){
            $res = $apiObj->getCardInfoByCid($customerId);
            if( is_array($res) && array_key_exists('status', $res) && $res['status'] == 200 ){
                echo json_encode($res);
                return;
            }
        }
        echo json_encode($res);
        return;
    }

    if($type == "GET_CUSTOMER_BY_ACCOUNT"){

        if( !empty($customerAcc) ){
            $res = $apiObj->getCustomerInfoByAcc($customerAcc);
            if( is_array($res) && array_key_exists('status', $res) && $res['status'] == 200 ){
                echo json_encode($res);
                return;
            }
        }
        echo json_encode($res);
        return;
    }
    


}); */







// Mail Test
/* Route::get('mt', function(){

    dd( config('others.APP_BASE_URL') );
    (new MailController(
        ['sagor@genusys.us', 'rokibuzzaman@genusys.us'],
        'Ticketing Sysytem',
        'Hello',
        ['address'=>'ticket@genusys.us', 'head'=>'Gplex Ticket']
    ))->composeEmail();
    
}); */
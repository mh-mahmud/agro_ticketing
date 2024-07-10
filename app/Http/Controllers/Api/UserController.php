<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\Request;
use Auth;
use App\Mail\TestEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Helpers\EmailHelper;
class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        // $this->middleware('acl:super-admin');
        $this->userService = $userService;
    }
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        
        if(Auth::user()->can('user-list')) {
            return $this->userService->listItems($request);

        }
        return $this->noPermissionResponse();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if(Auth::user()->can('user-create')) {

            return $this->userService->createItem($request);

        }
        return $this->noPermissionResponse();
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        if(Auth::user()->can('user-list') || Auth::user()->can('ticket-create')) {

            return $this->userService->showItem($id);

        }
        return $this->noPermissionResponse();
    }

    public function showOwnData($id)
    {
        if(Auth::user()->id === $id) {

            return $this->userService->showItem($id);

        }
        return $this->noPermissionResponse();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        if(Auth::user()->can('user-edit')) {

            return $this->userService->updateItem($request,$id);

        }
        return $this->noPermissionResponse();
    }

    public function updateOwnProfile(Request $request, $id)
    {
        if(Auth::user()->id === $id) {

            return $this->userService->updateItem($request,$id);

        }
        return $this->noPermissionResponse();
    }

    public function changePassword(Request $request,$id){
        if(Auth::user()->id === $id) {
            return $this->userService->updatePassword($request,$id);
        }
        return $this->noPermissionResponse();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if(Auth::user()->can('user-delete')) {

            return $this->userService->deleteItem($id);

        }
        return $this->noPermissionResponse();
    }

    public function changeItemStatus(Request $request, $id)
    {

        return $this->userService->changeItemStatus($request, $id);

    }

    public function checkUniqeInfo(Request $request){
        return $this->userService->checkUniqueIdentity($request);
    }

    public function storeSpecialPermissions(Request $request, $id){

        
        if(Auth::user()->can('user-edit') || Auth::user()->can('user-create')) {

            return $this->userService->storeSpecialPermissions($request, $id);

        }
        return $this->noPermissionResponse();

    }

    public function getSpecialPermissions($id){
        return $this->userService->getSpecialPermissions($id);
    }

    public function logout(Request $request) {

        if ($request->user()->token()->revoke()){
            return response()->json([
                'status'        => 200,
                'message'       => 'Logged out successfully!'
            ]);

        } else{
            return response()->json([
                'status'        => 424,
                'message'       => "Could not logout!"
            ]);
        }
    }

    public function getUsersByRoleName($roleName){
        if(Auth::user()->can('user-list')) {

            return $this->userService->getUsersByRoleName($roleName);

        }
        return $this->noPermissionResponse();
    }

    public function searchUserList(Request $request){

        return $this->userService->searchUserList($request);

    }

    public function checkCustomerExist(Request $request){
        
        return $this->userService->checkCustomerExist($request);

    }

    public function sendEmail()
    {
        $to = 'ishtiak@genusys.us';
        $subject = 'Hello, Laravel PHPMailer';
        $message = '<p>This is a test email sent from Laravel using PHPMailer.</p>';

        if (EmailHelper::sendEmail($to, $subject, $message)) {
            return "Email sent successfully!";
        } else {
            return "Email could not be sent.";
        }
    }
}

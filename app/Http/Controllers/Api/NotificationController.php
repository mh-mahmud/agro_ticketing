<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Auth;

class NotificationController extends Controller
{

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        return $this->notificationService->listItems($request);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
//        dd($request->all());
        return $this->notificationService->createItem($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if (Auth::user()->can('notification-delete')) {

            return $this->notificationService->deleteItem($id);
        }

        return $this->noPermissionResponse();
    }

    public function bulkDestroy(Request $request)
    {
        if (Auth::user()->can('notification-delete')) {

            return $this->notificationService->deleteItem($request);

        }

        return $this->noPermissionResponse();
    }

    public function storeNoticeWithUsers(Request $request){
        if(isset($request->ticketId) && isset($request->note)){
            return $this->notificationService->storeNoticeWithUsers($request->ticketId, $request->note);
        }
    }

    public function newNotificationCount(){
        return $this->notificationService->getNewNotificationCount();
    }

    public function setNotificationToSeen(){
        return $this->notificationService->setNotificationToSeen();
    }
}

<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\TicketService;
use Auth;

class TicketController extends Controller
{
    protected $service;

    public function __construct()
    {
        // $this->middleware('acl:super-admin');
        $this->service   = new TicketService;
    }

    public function index(Request $request)
    {
        if (Auth::user()->can('ticket-list')) {
            
            return $this->service->listItems($request);

        }
        return $this->noPermissionResponse();
    }

    public function ticketDownloadCsv(Request $request)
    {
        if (Auth::user()->can('ticket-list')) {
            
            return $this->service->ticketDownloadCsv($request);

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
        if (Auth::user()->can('ticket-list')) {
            
            return $this->service->showItem($id);
        }
        return $this->noPermissionResponse();
    }

    public function update(Request $request, $id)
    {
        if (Auth::user()->can('ticket-edit')) {

            return $this->service->updateItem($request, $id);
        }
        return $this->noPermissionResponse();
    }

    public function updateFromReplySection(Request $request, $id)
    {
        if (Auth::user()->can('change-ticket-status')) {

            return $this->service->updateFromReplySection($request, $id);
        }
        return $this->noPermissionResponse();
    }

    public function reopen($id)
    {
        if (Auth::user()->can('reopen-ticket')) {

            return $this->service->reopen($id);
        }
        return $this->noPermissionResponse();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function store(Request $request)
    {
        return $this->service->createItem($request);
    }

    public function uploadTicketMedia(Request $request)
    {
        return $this->service->saveFiles($request);
    }

    public function destroy($id)
    {
        if (Auth::user()->can('ticket-delete')) {
            return  $this->service->deleteItem($id);
        }

        return $this->noPermissionResponse();
    }

    public function ticketsNeedToApprove(Request $request){
        if (Auth::user()->can('ticket-approval')) {
            return $this->service->listItems($request, 1);
        }
    }

    public function approveTicket($id){
        if (Auth::user()->can('ticket-approval')) {
            return $this->service->approveTicket($id);
        }
    }

    /**
     * Who can see tickets
     * @return Collection of Users
     */
    public function getWhoCanSeeTicket($ticketId){
        return $this->service->getWhoCanSeeTicket($ticketId);
    }
}

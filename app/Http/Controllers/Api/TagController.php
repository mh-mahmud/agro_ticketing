<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Http\Request;
use Auth;

class TagController extends Controller
{
    protected $service;

    public function __construct(TagService $service)
    {
        // $this->middleware('acl:super-admin');
        $this->service   = $service;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if (Auth::user()->can('tag-list') || Auth::user()->can('ticket-list')) {

            return $this->service->listItems($request);
        }

        return $this->noPermissionResponse();
    }

    public function getList(Request $request)
    {
        return $this->service->listItems($request);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
       if (Auth::user()->can('tag-create')) {
            return $this->service->createItem($request);
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
        if (Auth::user()->can('tag-list')) {
            return $this->service->showItem($id);
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
        if (Auth::user()->can('tag-edit')) {
            return $this->service->updateItem($request, $id);
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
        if (Auth::user()->can('tag-delete')) {
            return  $this->service->deleteItem($id);
        }

        return $this->noPermissionResponse();
    }
}

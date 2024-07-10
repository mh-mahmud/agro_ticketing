<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TypeService;
use App\Services\SubTypeService;
use Illuminate\Http\Request;
use Auth;
use Illuminate\Support\Facades\Validator;

class SubTypeController extends Controller
{
    protected $service;

    public function __construct(TypeService $service)
    {
        // $this->middleware('acl:super-admin');
        $this->typeService      = $service;
        $this->subTypeService   = new SubTypeService;
    }
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if (Auth::user()->can('type-list') || Auth::user()->can('ticket-list')) {

            return $this->subTypeService->listItems($request);
        }

        return $this->noPermissionResponse();
    }
    
    /**
     * Select option list
     */
    public function getList($parent_id)
    {
        
        return $this->subTypeService->listItems(new Request(['parent_id'=>$parent_id]));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
       if (Auth::user()->can('type-create')) {

            $validator = Validator::make($request->all(),[

                'category'              => 'required|numeric'

            ]);

            if($validator->fails()) {

                return response()->json([
                    'status_code'       => 400,
                    'messages'          => config('status.status_code.400'),
                    'errors'            => $validator->errors()->all()
                ]);

            }
            return $this->typeService->createItem($request);

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
        /* if (Auth::user()->can('type-list')) {
            return $this->typeService->showItem($id);
        }

        return $this->noPermissionResponse(); */
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
        if (Auth::user()->can('type-edit')) {
 
            $validator = Validator::make($request->all(),[

                'category'              => 'required|numeric'

            ]);

            if($validator->fails()) {

                return response()->json([
                    'status_code'       => 400,
                    'messages'          => config('status.status_code.400'),
                    'errors'            => $validator->errors()->all()
                ]);

            }
            return $this->typeService->updateItem($request, $id);
 
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
        /* if (Auth::user()->can('type-delete')) {
            return  $this->typeService->deleteItem($id);
        }

        return $this->noPermissionResponse(); */
    }
}

<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\Crm\CrmAuthService;
use App\Services\Crm\CrmApiService;
use DB;
use App\Http\Controllers\Api\AuthController;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Support\Facades\Auth;

class CrmApiController extends Controller
{
    public function createUser(Request $request){
        $username               = $request->header('username');
        $password               = $request->header('password');
        $requestReceiveWithin = (time() - $request->requestTimestamp);
        
        // Check if request time within 60 second
        if(  $requestReceiveWithin < 0 || (time() - $request->requestTimestamp) > 60 ){
            return response()->json([
                'status'    => 408,
                'messages'  => config('status.status_code.408')
            ]);
        }
        if($username && $password && ($user = (new CrmAuthService)->isAuthentic($username, $password)) && $user->status == 1){
            Auth::attempt(array('username' => $username, 'password' => $password, 'status' => 1));
            if(Auth::user()->can('user-create')) {
                
                $userService = new UserService();
                return $userService->createItem($request);
    
            }
            return $this->noPermissionResponse();

        }else{
            return response()->json([
                'status'    => 451,
                'messages'  => config('status.status_code.451')
            ]);
        }
        
    }

    public function getTicketList(Request $request){
        
        $input      = $request->all();
        $validator  = Validator::make($input, [

            'mobile'            => 'required',
            // 'skill_id'          => 'required',
            'requestTimestamp'  => 'required'

        ]);

        if ($validator->fails()) {

            return response()->json([
                'status_code'   => 400,
                'messages'      => config('status.status_code.400'),
                'errors'        => $validator->messages()->all()
            ]);

        }else{

            $username               = $request->header('username');
            $password               = $request->header('password');
            $requestReceiveWithin = (time() - $request->requestTimestamp);
            
            // Check if request time within 60 second
            if(  $requestReceiveWithin < 0 || (time() - $request->requestTimestamp) > 60 ){
                return response()->json([
                    'status'    => 408,
                    'messages'  => config('status.status_code.408')
                ]);
            }
            
            if($username && $password && ($user = (new CrmAuthService)->isAuthentic($username, $password)) && $user->status == 1){

                // Check permission by skill id
                /* if($permissions = (new CrmApiService)->getSkillWisePermissions($input['skill_id'])){
                    if(in_array( 'ticket-list', $permissions )){ */
                        // Get tickets by user mobile number
                        
                        $collection = DB::table('tickets')
                                        ->join('user_details', 'user_details.id', '=', 'tickets.contact_id')
                                        ->leftjoin('users', 'users.id', '=', 'user_details.id')
                                        ->join('types', 'types.id', '=', 'tickets.type_id')
                                        ->join('statuses', 'statuses.id', '=', 'tickets.status_id')
                                        ->join('priorities', 'priorities.id', '=', 'tickets.priority_id')
                                        ->join('groups', 'groups.id', '=', 'tickets.group_id')
                                        ->leftjoin('sources', 'sources.id', '=', 'tickets.source_id')
                                        /* ->leftjoin('tickets_agents', 'tickets.id', '=', 'tickets_agents.ticket_id')
                                        ->where('tickets_agents.status', '=', '1') */
                                        ->select(
                                            'tickets.id as ticket_id',
                                            'tickets.subject',
                                            'tickets.contact_id',
                                            'tickets.description',
                                            'tickets.created_at',
                                            'types.name as type_name',
                                            'statuses.name as status_name',
                                            'priorities.name as priority_name',
                                            'groups.name as group_name',
                                            'sources.name as source_name'
                                        )
                                        ->where('user_details.mobile', $input['mobile'])
                                        ->orderBy('tickets.created_at', 'desc')
                                        ->paginate(config('others.ROW_PER_PAGE'));
                        $data['data'] = json_decode($collection->toJson(), 1)['data'];
                        return $data;
                    /* }
                }else{
                    // Skill id not found
                    return response()->json([
                        'status'    => 404,
                        'messages'  => 'Skill not found'
                    ]);
                } */

            }else{
                return response()->json([
                    'status'    => 451,
                    'messages'  => config('status.status_code.451')
                ]);
            }
        }

    }

    public function getAuthToken(Request $request){
        $authRequest = new Request([
            'username' => $request->header('username'),
            'password' => $request->header('password')
        ]);
        $authData = (new AuthController)($authRequest);
        return json_encode($authData->getdata()->token);
    }
}

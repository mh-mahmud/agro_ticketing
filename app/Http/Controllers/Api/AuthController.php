<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\UserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Auth;

class AuthController extends Controller
{
    protected $userRepository;


    /**
     * AuthController constructor.
     * @param UserRepository $userRepository
     */
    public function __construct()
    {

        $this->userRepository   = new UserRepository;

    }


    public function __invoke(Request $request)
    {
        $input                  = $request->all();

        $validator = Validator::make($request->all(), [

            'username'          => 'required',
            'password'          => 'required'

        ]);

        if ($validator->fails()) {

            return response()->json([
                'status_code'   => 400,
                'messages'      => config('status.status_code.400'),
                'errors'        => $validator->messages()->all()
            ]);

        } else {

            $fieldType          = filter_var($request->username, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

            if(Auth::attempt(array($fieldType   => $input['username'], 'password' => $input['password'], 'status' => 1)) )
            {
                if(Auth::user()->can('admin-panel')){
                    $user               = Auth::user();
                    $userInfo           = $this->userRepository->show($user->id);
                    $data['status']     = 200;
                    $data['messages']   = config('status.status_code.200');
                    $data['token']      = $user->createToken('ventura')->accessToken;
                    $data['user_info']  = $userInfo;
                    $data['api_user']   = Auth::user()->apiUser;
                    
                    return response()->json($data);
                }else{
                    $data['status']     = 401;
                    $data['messages']   = config('status.status_code.401');
                    return response()->json($data);
                }
            } else {
                $data['status']     = 451;
                $data['messages']   = config('status.status_code.451');
                return response()->json($data);
            }

        }

    }
}

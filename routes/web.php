<?php

use App\Http\Controllers\Api\GroupController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MailController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Gate;
use App\Http\Controllers\TestController;
use App\Helpers\Helper;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
/* Route::get('/', function () {

    return Helper::fileUpload("avatar/", "123.jpg");

}); */
/* Route::get('/test', [TestController::class, 'index']);
Route::get('/test2', function(){
    $array = [
        'company' => [
            'contacts'  => [
                'first_names',
                'last_name',
                'emails',
                'phones1' => [
                    'test',
                ],
                'phones2' => [
                    'test',
                ],
            ],
            'addresses' => [
                'postal_code',
            ],
        ]
    ];

    dd( Arr::dot($array) );
}); */


/* Route::get("email", [MailController::class, "email"])->name("email");

Route::get("send-email", [MailController::class, "composeEmail"])->name("send-email"); */

// Route::get('users/{id}', [UserController::class, 'destroy']);
Route::get('gettree', [GroupController::class, 'getTree']);

Route::get("send-email", [UserController::class, "sendEmail"])->name("send-email");


// Route::get('lead_test', function(){
//     echo "Working";
// });

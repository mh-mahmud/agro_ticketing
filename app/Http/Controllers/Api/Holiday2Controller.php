<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\HolidayService2;
use Illuminate\Http\Request;
use Auth;

class Holiday2Controller extends Controller
{
    protected $holidayService;

    public function __construct()
    {
        $this->holidayService = new HolidayService2();
    }

    public function store(Request $request)
    {
        return $this->holidayService->createItem($request);
    }

    public function update(Request $request, $id)
    {
        return $this->holidayService->updateItem($request, $id);
    }
}

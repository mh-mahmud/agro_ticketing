<?php

namespace App\Http\Controllers\Api\Report;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Auth;
use App\Services\Report\GroupReportService;

class GroupReportController extends Controller
{
    protected $groupReportService;

    public function __construct()
    {
        $this->groupReportService = new GroupReportService;
    }

    public function dateWiseReport(Request $request)
    {
        
        if (Auth::user()->can('group-report')) {
            
            return $this->groupReportService->getDateWiseReport($request);

        }
        return $this->noPermissionResponse();
    }

    public function dateWiseReportDownloadCsv(Request $request){
        
        if (Auth::user()->can('group-report')) {
            
            return $this->groupReportService->dateWiseReportDownloadCsv($request);

        }
        return $this->noPermissionResponse();
    }

}
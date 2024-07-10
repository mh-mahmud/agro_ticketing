<?php

namespace App\Http\Controllers\Api\Report;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Ticket;
use Auth;
use App\Services\Report\StatusReportService;
use App\Exports\Export;
use Excel;

class StatusReportController extends Controller
{
    protected $statusReportService;

    public function __construct()
    {
        $this->statusReportService = new StatusReportService;
    }

    public function dateWiseReport(Request $request)
    {
        
        if (Auth::user()->can('status-report')) {
            
            return $this->statusReportService->getDateWiseReport($request);

        }
        return $this->noPermissionResponse();
    }

    public function dateWiseReportDownloadCsv(Request $request){
        
        if (Auth::user()->can('status-report')) {
            
            return $this->statusReportService->dateWiseReportDownloadCsv($request);

        }
        return $this->noPermissionResponse();
    }

}

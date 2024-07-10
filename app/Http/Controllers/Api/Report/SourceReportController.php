<?php

namespace App\Http\Controllers\Api\Report;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Auth;
use App\Services\Report\SourceReportService;

class SourceReportController extends Controller
{
    protected $sourceReportService;

    public function __construct()
    {
        $this->sourceReportService = new SourceReportService;
    }

    public function dateWiseReport(Request $request)
    {
        
        if (Auth::user()->can('source-report')) {
            
            return $this->sourceReportService->getDateWiseReport($request);

        }
        return $this->noPermissionResponse();
    }

    public function dateWiseReportDownloadCsv(Request $request){
        
        if (Auth::user()->can('source-report')) {
            
            return $this->sourceReportService->dateWiseReportDownloadCsv($request);

        }
        return $this->noPermissionResponse();
    }

}

<?php

namespace App\Http\Controllers\Api\Report;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Ticket;
use Auth;
use App\Services\Report\TypeReportService;
use App\Exports\Export;
use Excel;

class TypeReportController extends Controller
{
    protected $typeReportService;

    public function __construct()
    {
        $this->typeReportService = new TypeReportService;
    }

    public function dateWiseReport(Request $request)
    {
        
        if (Auth::user()->can('type-report')) {
            
            return $this->typeReportService->getDateWiseReport($request);

        }
        return $this->noPermissionResponse();
    }

    public function dateWiseReportDownloadCsv(Request $request){
        
        if (Auth::user()->can('type-report')) {
            
            return $this->typeReportService->dateWiseReportDownloadCsv($request);

        }
        return $this->noPermissionResponse();
    }
}

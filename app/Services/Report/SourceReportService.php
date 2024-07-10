<?php

namespace App\Services\Report;

use App\Helpers\Helper;
use App\Models\Source;
use App\Repositories\SourceRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Repositories\TicketRepository;
use App\Exports\Export;
use Excel;

class SourceReportService
{
    protected $ticketRepository;
    protected $repository;

    public function __construct()
    {

        $this->ticketRepository = new TicketRepository;
        $this->repository = new SourceRepository;

    }

    public function getDateWiseReport($request)
    {

        DB::beginTransaction();

        try{

            $errors = [];

            if($request->start_date && $request->end_date){

                $startDate  = $request->start_date;
                $endDate    = $request->end_date;
                if(!Helper::isDateValid($startDate, 'Y-m-d') || !Helper::isDateValid($endDate, 'Y-m-d')){
                    $errors[] = 'Please enter a valid date';
                }

            }else{

                $startDate = date('Y-m-d', strtotime("-" . config('others.MAX_REPORT_DAYS') . " days"));
                $endDate   = date('Y-m-d');

            }
            
            if(!Helper::isDateRangeValid($startDate, $endDate)){
                $errors[] = "Date range is not valid! You can see maximum " . config('others.MAX_REPORT_DAYS') . ' days report.';
            }

            if(count($errors)){
                return response()->json([
                    'status'    => 400,
                    'messages'  => config('status.status_code.400'),
                    'errors'    => $errors
                ]);
            }
            
            $query = $this->ticketRepository->getTicketQuery()
                                            ->whereBetween('tickets.created_at', [$startDate . ' 00:00:00', $endDate . " 23:59:59"])
                                            ->where(function($q) use($request){
                                                // If source_id not given then get all source
                                                if(isset($request->source_id)){
                                                    $q->where('tickets.source_id', $request->source_id);
                                                }
                                            });
            $pagination = true;
            if(isset($request->page) && $request->page == "*"){
                // Return All Data
                $collections    = $query->get();
                $pagination     = false;
            }else{
                $collections    = $query->paginate(config('others.ROW_PER_PAGE'));
                $pagination     = true;
            }
            
            // Format date
            foreach($collections as $ticket){
                $ticket->created_at_formated = date('d-M-Y h:i:s A', strtotime($ticket->created_at));
            }

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'    => 424,
                'messages'  => config('status.status_code.424'),
                'error'     => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'    => 200,
            'pagination'=> $pagination,// Boolean
            'query_data'=>[
                'start_date'=> $startDate,
                'end_date'  => $endDate
            ],
            'messages'  => config('status.status_code.200'),
            'collections'=> $collections
        ]);
    }

    public function dateWiseReportDownloadCsv($request){

        if(!Helper::isDateValid($request->start_date, 'Y-m-d') || !Helper::isDateValid($request->end_date, 'Y-m-d')){
            $request->start_date = date('Y-m-d', strtotime("-" . config('others.MAX_REPORT_DAYS') . " days"));
            $request->end_date   = date('Y-m-d');
        }

        $reportData = $this->getDateWiseReport($request)->getData();
            
            $heading = [[
                'ID',
                'Title',
                'Type',
                'Group',
                'Priority',
                'Source',
                'Created At',
                'Status'
            ]];

            $data = array_map(function($ticket){
                return [
                    'id'         => $ticket->id,
                    'subject'    => $ticket->subject,
                    'type'       => $ticket->type->name,
                    'group'      => $ticket->group->name,
                    'priority'   => $ticket->priority->name,
                    'source'     => $ticket->source->name ?? '-',
                    'created_at' => $ticket->created_at_formated,
                    'status'     => $ticket->status->name.'-'.$ticket->group->name
                ];
            }, $reportData->collections);

            $data = array_merge($heading, $data);

            return Excel::download(new Export($data), "Source Report for {$reportData->query_data->start_date} to {$reportData->query_data->end_date}.csv");

    }

}
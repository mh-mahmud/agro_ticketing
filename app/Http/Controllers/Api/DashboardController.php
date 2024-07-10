<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Ticket;
use Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        
        $permissionArray = ['Super Admin', 'Admin', 'Manager'];

        $totalTicket = Ticket::orderBy('created_at', 'DESC')->get();

        if (Auth::user()->roles->contains('slug', 'super-admin')) 
            $createTicketList = Ticket::orderBy('created_at', 'DESC')->get();
        else
            $createTicketList = Ticket::where('contact_id', Auth::user()->id)->orderBy('created_at', 'DESC')->get();


        $dateS = Carbon::now()->startOfMonth()->subMonth(1);
        $dateE = Carbon::now()->startOfMonth();
        $totalTicCountLastMonth = Ticket::select('id')->whereBetween('created_at', [$dateS, $dateE])->get()->count();
        $totalTicCountPresentMonth = Ticket::select('id')->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get()->count();
        $totalTicCountCom = $totalTicCountPresentMonth - $totalTicCountLastMonth;

        if ($totalTicCountLastMonth != 0) {
            $totalTicPct = $totalTicCountCom * 100 / $totalTicCountLastMonth;
        } else {
            $totalTicPct = 0;
        }

        if (Auth::user()->roles->contains('slug', 'super-admin')) 
            $createTicCountLastMonth = Ticket::select('id')->whereBetween('created_at', [$dateS, $dateE])->get()->count();
        else 
            $createTicCountLastMonth = Ticket::select('id')->where('contact_id', Auth::user()->id)->whereBetween('created_at', [$dateS, $dateE])->get()->count();
    
        if (Auth::user()->roles->contains('slug', 'super-admin')) 
            $createTicCountPresentMonth = Ticket::select('id')->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get()->count();
        else
            $createTicCountPresentMonth = Ticket::select('id')->where('contact_id', Auth::user()->id)->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get()->count();

        $createTicCountCom = $createTicCountPresentMonth - $createTicCountLastMonth;

        if ($createTicCountLastMonth != 0) {
            $createTicPct = $createTicCountCom * 100 / $createTicCountLastMonth;
        } else {
            $createTicPct = 0;
        }

        if (Auth::user()->roles->contains('slug', 'super-admin')) 
            $openTicCountLastMonth = Ticket::whereBetween('created_at', [$dateS, $dateE])->get();
        else
            $openTicCountLastMonth = Ticket::where('contact_id', Auth::user()->id)->whereBetween('created_at', [$dateS, $dateE])->get(); 

        if (Auth::user()->roles->contains('slug', 'super-admin')) 
            $openTicCountPresentMonth = Ticket::whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get();
        else 
            $openTicCountPresentMonth = Ticket::where('contact_id', Auth::user()->id)->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get();
       
        $openTicCountLastMonthStatus = $openTicCountLastMonth->where('status.slug', 'open')->count();
        $openTicCountPresentMonthStatus = $openTicCountPresentMonth->where('status.slug', 'open')->count();
        $openTicCountCom = $openTicCountPresentMonthStatus - $openTicCountLastMonthStatus;

        if ($openTicCountLastMonthStatus != 0) {
            $openTicPct = $openTicCountCom * 100 / $openTicCountLastMonthStatus;
        } else {
            $openTicPct = 0;
        }

        if (Auth::user()->roles->contains('slug', 'super-admin'))        
            $closedTicCountLastMonth = Ticket::whereBetween('created_at', [$dateS, $dateE])->get();
        else 
            $closedTicCountLastMonth = Ticket::where('contact_id', Auth::user()->id)->whereBetween('created_at', [$dateS, $dateE])->get();

        if (Auth::user()->roles->contains('slug', 'super-admin'))          
            $closedTicCountPresentMonth = Ticket::whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get();
        else
            $closedTicCountPresentMonth = Ticket::where('contact_id', Auth::user()->id)->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get();

        $closedTicCountLastMonthStatus = $closedTicCountLastMonth->where('status.slug', 'closed')->count();
        $closedTicCountPresentMonthStatus = $closedTicCountPresentMonth->where('status.slug', 'closed')->count();
        $closedTicCountCom = $closedTicCountPresentMonthStatus - $closedTicCountLastMonthStatus;
        if ($closedTicCountLastMonthStatus != 0) {
            $closedTicPct = $closedTicCountCom * 100 / $closedTicCountLastMonthStatus;
        } else {
            $closedTicPct = 0;
        }


        $data = [];
		
        $data['total_ticket'] = round($totalTicket->count(), 2);
        $data['total_create_ticket'] = round($createTicketList->count(), 2);
        $data['total_open_ticket'] = $createTicketList->where('status.slug', 'open')->count();
        $data['total_close_ticket'] = round($createTicketList->where('status.slug', 'closed')->count(), 2);
        $data['total_pending_ticket'] = round($createTicketList->where('status.slug', 'pending')->count(), 2);

        $data['total_ticket_pct'] =  round($totalTicPct, 2);
        $data['create_ticket_pct'] = round($createTicPct, 2);
        $data['open_ticket_pct'] =   round($openTicPct, 2);
        $data['closed_ticket_pct'] = round($closedTicPct, 2);

        return response()->json([
            'status_code' => 200,
            'messages' => config('status.status_code.200'),
            'dashboardData' => $data,
            // 'overdue_task' => $overDueTask
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}

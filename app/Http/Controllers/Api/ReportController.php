<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Ticket;
use Auth;
use Carbon\Carbon;
class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
       
        $totalTicket = Ticket::orderBy('created_at','DESC')->get();
        $createTicketList = Ticket::where('contact_id',Auth::user()->id)->orderBy('created_at','DESC')->get();

        $dateS = Carbon::now()->startOfMonth()->subMonth(1);
        $dateE = Carbon::now()->startOfMonth(); 
        $totalTicPctLastMonth = Ticket::select('id')->whereBetween('created_at',[$dateS,$dateE])->get()->count()/100;
        $totalTicPctPresentMonth = Ticket::select('id')->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get()->count()/100;
        $totalTicPct=$totalTicPctPresentMonth-$totalTicPctLastMonth;

        $createTicPctLastMonth = Ticket::select('id')->where('contact_id',Auth::user()->id)->whereBetween('created_at',[$dateS,$dateE])->get()->count()/100;
        $createTicPctPresentMonth = Ticket::select('id')->where('contact_id',Auth::user()->id)->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get()->count()/100;
        $createTicPct=$createTicPctPresentMonth-$createTicPctLastMonth;

        $openTicPctLastMonth = Ticket::where('contact_id',Auth::user()->id)->whereBetween('created_at',[$dateS,$dateE])->get();
        $openTicPctPresentMonth = Ticket::where('contact_id',Auth::user()->id)->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get();
        $openTicPct=$openTicPctPresentMonth->where('status.slug','open')->count()/100-$openTicPctLastMonth->where('status.slug','open')->count()/100 ;

        $closedTicPctLastMonth = Ticket::where('contact_id',Auth::user()->id)->whereBetween('created_at',[$dateS,$dateE])->get();
        $closedTicPctPresentMonth = Ticket::where('contact_id',Auth::user()->id)->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->get();
        $closedTicPct=$closedTicPctPresentMonth->where('status.slug','closed')->count()/100-$closedTicPctLastMonth->where('status.slug','closed')->count()/100 ;
        
        $data = [];
        $data['total_ticket'] = round($totalTicket->count(), 2);
        $data['total_create_ticket'] = round($createTicketList->count(), 2);
        $data['total_open_ticket'] = round($createTicketList->where('status.slug','open')->count(), 2);
        $data['total_close_ticket'] = round($createTicketList->where('status.slug','closed')->count(), 2);
        $data['total_pending_ticket'] = round($createTicketList->where('status.slug','pending')->count(), 2);

        $data['total_ticket_pct'] =  round($totalTicPct, 2);
        $data['create_ticket_pct'] = round($createTicPct, 2);
        $data['open_ticket_pct'] =   round($openTicPct, 2);
        $data['closed_ticket_pct'] = round($closedTicPct, 2);
        

        return response()->json([
            'status_code' => 200,
            'messages'=>config('status.status_code.200'),
            'reportData'=> $data,
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

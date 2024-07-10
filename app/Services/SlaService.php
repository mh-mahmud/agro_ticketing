<?php

namespace App\Services;

use App\Helpers\Helper;
use App\Models\BusinessHour;
use Illuminate\Support\Facades\DB;
use App\Models\Holiday;

class SlaService
{

    /**
    * Calculate Remaining SLA time in second
    * @return Array
    * @author Anisur Rahman Sagor
    */
    public function calculateSlaTimeLeft(\App\Models\Ticket $ticket, Array $holidays, Array $weeklyBusinessDays, Array $businessHours){
        
        $slaPeriodAlreadyGoneInSec = $totalSlaPeriodInSec = 0;
        
        if( $ticket->status->slug == 'closed' ){
            goto IF_STATUS_CLOSE;
        }

        $created = new \DateTime($ticket->created_at->format('Y-m-d H:i:s'));

        // Ticket created period
        $periods = new \DatePeriod(
            new \DateTime( $created->format('Y-m-d') ),
            new \DateInterval('P1D'),
            new \DateTime()// Till today
        );

        $businessPeriods  = [];
        
        foreach($periods as $period){
            
            $week = strtoupper($period->format('D'));
            if( in_array($week, $weeklyBusinessDays) ){// Remove weekly holidays
                $businessPeriods[ $period->format('Y-m-d') ] = strtoupper($period->format('D'));
            }

        }
        
        $businessPeriods = array_diff_key($businessPeriods, $holidays)/* Remove Holiodays */;

        /* Calculate total business time spent in second */
        foreach( $businessPeriods as $date => $weekName ){
            
            $startTime  = $businessHours[$weekName][0];
            $endTime    = $businessHours[$weekName][1];

            /* Check ticket created date */
            if( $created->format('Y-m-d') == $date ){
                /* If ticket created time is after the starting business hour then take created time */
                if( $created->getTimestamp() > strtotime($created->format('Y-m-d') . ' ' . $startTime) ){
                    $startTime = $created->format('H:i:s');
                }
                // Check if ticket created time is after end time
                if( $created->getTimestamp() > strtotime($created->format('Y-m-d') . ' ' . $endTime) ){
                    continue; // Dont take it
                }
            }

            /* Check todays time */
            if( date('Y-m-d') == $date && time() < strtotime(date('Y-m-d') . ' ' . $endTime) ){
                $endTime = date('H:i:s');
            }
            
            /* Validate start and end time */
            if( strtotime(date('Y-m-d') . ' ' . $endTime) < strtotime(date('Y-m-d') . ' ' . $startTime) ){
                continue; // Dont take it
            }

            $slaPeriodAlreadyGoneInSec +=  strtotime($endTime) - strtotime($startTime);

        }

        /* Total SLA Period Calculation */
        $slaDays    = (int)$ticket->type->day;// Working days
        $slaHour    = (int)$ticket->type->hour;
        $slaMin     = (int)$ticket->type->min;
        $slaPeriods = [];
        $addedDay   = 0;
        $tempDay    = $created->sub(new \DateInterval("P1D"))->format('Y-m-d');
        
        while( $addedDay < $slaDays ){

            $date = new \DateTime($tempDay);
            $date->add(new \DateInterval("P1D"));
            /* Skipping weekly holiday and holiday */
            if(in_array(strtoupper($date->format('D')), $weeklyBusinessDays) && !array_key_exists($date->format('Y-m-d'), $holidays)){
                $slaPeriods[$tempDay=$date->format('Y-m-d')] = strtoupper($date->format('D'));
                $addedDay++;
            }
            $tempDay = $date->format('Y-m-d');

        }

        /* Calculate total SLA in second */
        foreach( $slaPeriods as $date => $weekName ){

            $startTime  = $businessHours[$weekName][0];
            $endTime    = $businessHours[$weekName][1];
            $totalSlaPeriodInSec +=  strtotime($endTime) - strtotime($startTime);

        }

        $totalSlaPeriodInSec += ($slaHour * 60/* Minute */ * 60/* Second */) + ($slaMin * 60/* Second */);

        /* echo '<pre>';
        echo "Ticket created = {$ticket->created_at->format('Y-m-d H:i:s')} <br>";
        echo 'Holidays = <br>';
        print_r($holidays);
        echo 'Business Hours = <br>';
        print_r($businessHours);
        echo 'Business period = <br>';
        print_r($businessPeriods);
        echo 'SLA period = <br>';
        print_r( $slaPeriods );
        echo "<hr>";
        echo "Total SLA Period = {$totalSlaPeriodInSec}";
        echo "<hr>";
        echo "SLA period already gone = {$slaPeriodAlreadyGoneInSec}";
        echo "<hr>";
        echo "Remaining SLA Period = " . ($totalSlaPeriodInSec - $slaPeriodAlreadyGoneInSec);
        dump($ticket->created_at->format('Y-m-d H:i:s'));
        dump($ticket->type->hour);
        dump(($totalSlaPeriodInSec - $slaPeriodAlreadyGoneInSec));
        dd(); */

        IF_STATUS_CLOSE:
        return [
            'totalSlaPeriodInSec'       => $totalSlaPeriodInSec,
            'slaPeriodAlreadyGoneInSec' => $slaPeriodAlreadyGoneInSec,
            'remainingSlaPeriodInSec'   => ($totalSlaPeriodInSec - $slaPeriodAlreadyGoneInSec),
        ];

    }

}
export default class TicketService{

    // Status field for ticket list
    generateStatus(slaClaculated, status, group, forward_tickets_group, forward_tickets/* type, ticket_start_time */) {

        /* let sla_minute = 0;
        if (type) {
            sla_minute = ((type.day * 24 * 60) + (type.hour * 60) + type.min);
        }
        
        //ticket update time
        let server_date = new Date(ticket_start_time).toISOString().slice(0, 19).replace('T', ' ');
        server_date = new Date(server_date);
        //current time
        // let current_date = new Date(new Date().toUTCString()).getTime();
        let current_date = new Date();

        current_date.setMinutes(current_date.getMinutes() + current_date.getTimezoneOffset())

        //future time
        let future_date = new Date(server_date);
        
        future_date.setMinutes(future_date.getMinutes() + sla_minute);
        
        let difference = future_date.getTime() - current_date; // This will give difference in milliseconds
        let slaTimeLeft_minute = Math.ceil(difference / 60000);
 */
        let slaTimeLeft_minute = Math.round(slaClaculated.remainingSlaPeriodInSec / 60);
        let colorBg = '';

        if( status.slug == 'closed' ){
            colorBg = 'ts-status-main-closed';// Red Color #eb1313
        }else{
            if (slaTimeLeft_minute <= 119) {// Bellow 2 hours
                colorBg = 'ts-status-main-expired';// Red Color #eb1313
            }
    
            if (slaTimeLeft_minute > 119 && slaTimeLeft_minute < 360) {// 2 <=> 6 Hours
                colorBg = 'ts-status-main-pending'; // Orange Color #f75c1e
            }
    
            if (slaTimeLeft_minute >= 360 && slaTimeLeft_minute < 720) {// 6 <=> 12 Hours
                colorBg = 'ts-status-main-process';// Brown Color #914900
            }
    
            if (slaTimeLeft_minute >= 720) {// Above 12 Hours
                colorBg = 'ts-status-main-initial';// Green Color
            }
        }
        
        let status_ = status.name + "-" + (forward_tickets_group !== null ? forward_tickets_group.name : group.name) + (forward_tickets !== null ? " (Forwarded)" : '');
        switch (status.slug) {
            case 'closed':
                return <>
                    <p className={colorBg}>
                        <span className="ts-status-text-expired" title={status_}>{status_}</span>
                        {/* <span className="ts-status-expired"> </span> */}
                        {/* <span>{slaTimeLeft_minute}</span> */}
                    </p>
                </>
                break;
            case 'pending':
                return <>
                    <p className={colorBg}>
                        <span className="ts-status-text-pending" title={status_}>{status_}</span>
                        {/* <span className="ts-status-pending"> </span> */}
                        {/* <span>{slaTimeLeft_minute}</span> */}
                    </p>
                </>
                break;
            case 'open':
                return <>
                    <p className={colorBg}>
                        <span className="ts-status-text-process" title={status_}>{status_}</span>
                        {/* <span className="ts-status-process"> </span> */}
                        {/* <span>{slaTimeLeft_minute}</span> */}
                    </p>
                </>
                break;
            case 'resolved':
                return <>
                    <p className={colorBg}>
                        <span className="ts-status-text-done" title={status_}>{status_}</span>
                        {/* <span className="ts-status-done"></span> */}
                        {/* <span>{slaTimeLeft_minute}</span> */}
                    </p>
                </>
                break;
            default:
                return <>
                    <span>{status_}</span>
                    <span></span>
                </>
        }
    }

}
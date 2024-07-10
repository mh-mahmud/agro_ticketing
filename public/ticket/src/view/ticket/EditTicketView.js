import React, {Component} from 'react'
import {withRouter} from "react-router-dom";
import TicketForm from './TicketForm';

class EditTicketView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ticketData: {}
        }
    }

    render() {
        return (
            <>
                <div className="ts-d-top-header mb-4">
                    <div className="ts-d-acc-name">
                        <span className="bi bi-list"/>
                        <span className="ts-d-acc-name-text text-uppercase"> Edit ticket</span>
                    </div>
                </div>

                {/* Ticket Area*/}
                <div className="ts-d-tickets-area">
                    {/* Main Tickets Area*/}
                    <div className="ts-d-tickets-main">
                        <div className="ts-d-ct-forms">
                            <TicketForm
                                action="edit"
                            />
                        </div>
                    </div>
                    {/*End Main Tickets Area*/}
                </div>
                {/*End Ticket Area*/}
            </>
        )
    }
}

export default withRouter(EditTicketView);
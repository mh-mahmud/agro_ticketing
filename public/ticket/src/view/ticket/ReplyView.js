import React, {Component} from 'react'
import TicketDetails from './TicketDetails'
import Reply from './Reply'
import Api from '../../services/Api';
import Token from '../../services/Token';
import {API_URL, ANTD_MESSAGE_MARGIN_TOP} from "../../Config";
import {withRouter} from "react-router-dom";
import {message, Spin} from 'antd';

class ReplyView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataTableSpinning   : false,
            ticket              : null,
            isAllReady          : false
        }

        this.reopenTicket = this.reopenTicket.bind(this);
        this.updateTicket = this.updateTicket.bind(this);
    }

    async getTicket(id) {
        return await (new Api()).call('GET', API_URL + '/tickets/' + id, [], (new Token()).get());
    }

    async updateTicket(ticketData){
        this.setState({dataTableSpinning: true});
        this.setState({isAllReady: false});
        try {
            let formData = new FormData;
            formData.append('status_id', ticketData.status_id);
            formData.append('priority_id', ticketData.priority_id);
            formData.append('type_id', ticketData.type_id);
            formData.append('_method', "PUT");
            let response = await (new Api()).call('POST', API_URL + '/ticket/updateFromReplySection/' + this.state.ticket.id, formData, (new Token()).get());

            if (response.data.status == 200) {
                this.setTicket(this.state.ticket.id);
                message.success({
                    content: 'Update Successful',
                    style: {
                        marginTop: ANTD_MESSAGE_MARGIN_TOP,
                    }
                });
                return true;
            } else if (response.data.status_code == 424) {
                // this.setState({submitLoading: false});
                // this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    setTicket(id){
        this.getTicket(id).then((response) => {
            if (response.data.status == 404) {
                sessionStorage.setItem('error', "Ticket not found!");
                this.props.history.push('/tickets');
            } else {
                this.setState({ticket: response.data.ticket_info}, () => {
                    this.setState({dataTableSpinning: false});
                    this.setState({isAllReady: true});
                });
            }
        });
    }

    componentDidMount() {

        this.setState({dataTableSpinning: true});
        this.setState({isAllReady: false});
        if (this.props.match.params.id != undefined) {
            const id = this.props.match.params.id;
            this.setTicket(id);
        }

    }

    async getOpenStatus() {
        return await (new Api()).call('GET', API_URL + `/statuses?slug=open`, [], (new Token()).get());
    }

    async reopenTicket(){
        this.setState({dataTableSpinning: true});
        this.setState({isAllReady: false});
        this.getOpenStatus().then(async (response)=>{

            let formData = new FormData();
            formData.append('_method', "PUT");
            
            let ticket_response = await (new Api()).call('POST', API_URL + '/ticket/reopen/' + this.state.ticket.id, formData, (new Token()).get());
            await (new Api()).call('POST', API_URL + `/notification/storeNoticeWithUsers`, {ticketId: this.state.ticket.id, note: 'Ticket Reopend'}, (new Token()).get());

            if (ticket_response.data.status == 200) {
                this.setTicket(this.state.ticket.id);
                message.success({
                    content: 'Reopen Successful',
                    style: {
                        marginTop: ANTD_MESSAGE_MARGIN_TOP,
                    }
                });
            } else if (ticket_response.data.status_code == 424) {
                // this.setState({errors: ((new Helper).arrayToErrorMessage(ticket_response.data.errors))});
            }

        });
        
    }

    processRendering() {
        return <>

            <div className="ts-d-tickets-overview">
                <div className="ts-d-ticket-details-area">
                    <div className="row">

                        <TicketDetails
                            ticket       = {this.state.ticket}
                            reopenTicket = {this.reopenTicket}
                            updateTicket = {this.updateTicket}
                        />

                        <Reply
                            ticket    = {this.state.ticket}
                            getTicket = {this.getTicket}
                        />

                    </div>
                    <svg id="ts-d-ticket-bg-svg" xmlns="http://www.w3.org/2000/svg" width="296.767" height="635.984"
                         viewBox="0 0 296.767 635.984">
                        <g transform="translate(1550.12 -482.01)" opacity="0.2">
                            <path
                                d="M-1412,586.54c-10.27,37.85-6.74,79.12-1.85,118.54.17,1.4.35,2.8.52,4.21.98,7.72,1.97,15.49,2.89,23.27,1.57,13.37,2.93,26.79,3.57,40.17,1.2,24.76-.04,49.34-6.84,73.12-10.27,35.91-32.7,67.27-59.92,93.05q-2.4,2.28-4.84,4.48c-1.78,1.63-3.59,3.22-5.41,4.8-20.49,17.69-43.03,32.69-66.24,46.69V487.01a5,5,0,0,1,5-5h196.96c-18.99,27.79-42.9,52.56-56.41,83.35A150.8,150.8,0,0,0-1412,586.54Z"
                                fill="#0073e1" opacity="0.35"> </path>
                            <path
                                d="M-1272.26,595.61c-20.86,36.05-53.93,62.93-86.53,90-17.64,14.64-35.54,29.82-51.65,46.95q-5.37,5.7-10.45,11.7a219.214,219.214,0,0,0-26.63,39.05c-20.18,38.26-27.92,83.88-30.18,131.23-.46,9.56-.7,19.18-.77,28.84-.04,5.36-.02,10.72.03,16.09.36,35.79,2.12,73.86-10.75,107.54-10.77,28.15-35.65,51.33-60.93,50.98V487.01a5,5,0,0,1,5-5h281.66C-1245.92,518-1252.72,561.82-1272.26,595.61Z"
                                fill="#0dc3f8" opacity="0.4"> </path>
                        </g>
                    </svg>
                </div>
            </div>

        </>
    }

    render() {
        return (
            <>
                <div className="text-center p-1">
                    <Spin size="medium" tip="Please Wait..." spinning={this.state.dataTableSpinning}></Spin>
                </div>
                {this.state.isAllReady ? this.processRendering() : null}
            </>
        )
    }
}

export default withRouter(ReplyView);

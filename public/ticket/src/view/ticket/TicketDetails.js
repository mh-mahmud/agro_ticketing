import React, {Component} from 'react'
import {NavLink, withRouter} from "react-router-dom";
import Helper from '../../services/Helper';
import Api from '../../services/Api';
import Token from '../../services/Token';
import {Select} from 'antd';
import {API_URL} from "../../Config";
import { Spin } from 'antd';
import Auth from '../../services/Auth';

const {Option} = Select;

class TicketDetails extends Component {
    
    constructor(props) {
        super(props);
        this.state = {

            ticketData: {
                status_id       : '',
                priority_id     : '',
                type_id         : ''
            },
            allStatus           : null,
            allStausMod         : null,
            status: {
                selectOptions   : [],
                defaultValue    : 0
            },
            priorities: {
                selectOptions   : [],
                defaultValue    : 0
            },
            types: {
                selectOptions   : [],
                defaultValue    : 0
            },
            isAllStateUpdated   : false,
            ticketDetailsSpinning: false

        }
        this.auth = new Auth();
        this.original_status_id = null;
        this.Helper = new Helper();
        this.updateTicket = this.updateTicket.bind(this);
    }

    componentDidMount(){

        this.setState({ticketDetailsSpinning: true});
        let allStatus = this.getAllStatus();
        let allStausMod = [];
        allStatus.then((response) => {
            let canRepoenTicket = this.auth.isPermitted('reopen-ticket');
            this.setState({isAllStateUpdated: false});
            let {status} = this.state;
            let {selectOptions} = status;
            selectOptions = []; // Reset
            response.data.collections.map((status) => {
                allStausMod[status.id] = status;
                /* If user has no permission to reopen ticket then he can only colse the ticket */
                if( canRepoenTicket === false && status.slug !== 'closed' ){
                    return false;// Skip this step
                }
                selectOptions.push(<Option
                    key={status.id}
                    value={status.id}
                >
                    {status.name}
                </Option>);
            });
            status.selectOptions = selectOptions;
            status.defaultValue = this.props.ticket.status.id;
            this.setState({status}, ()=>{
                this.original_status_id = this.props.ticket.status.id;
            });
            let {ticketData} = this.state;
            ticketData.status_id = this.props.ticket.status.id;
            this.setState({ticketData}, ()=>{
                this.setState({allStatus: response.data.collections});
                this.setState({allStausMod});
                this.setState({isAllStateUpdated: true});
            });
        });

        let allPriorities = this.getAllPriorities();
        allPriorities.then((response) => {
            this.setState({isAllStateUpdated: false});
            let {priorities} = this.state;
            let {selectOptions} = priorities;
            selectOptions = []; // Reset
            response.data.collections.map((priority) => {
                selectOptions.push(<Option
                    key={priority.id}
                    value={priority.id}
                >
                    {priority.name}
                </Option>);
            });
            priorities.selectOptions = selectOptions;
            priorities.defaultValue = this.props.ticket.priority ? this.props.ticket.priority.id : '';
            this.setState({priorities});
            let {ticketData} = this.state;
            ticketData.priority_id = this.props.ticket.priority ? this.props.ticket.priority.id : '';
            this.setState({ticketData}, ()=>{
                this.setState({isAllStateUpdated: true});
            });
        });

        let allTypes = this.getAllTypes();
        allTypes.then((response) => {
            this.setState({isAllStateUpdated: false});
            let {types} = this.state;
            let {selectOptions} = types;
            selectOptions = []; // Reset
            response.data.collections.map((type) => {
                selectOptions.push(<Option
                    key={type.id}
                    value={type.id}
                >
                    {type.name}
                </Option>);
            });
            types.selectOptions = selectOptions;
            types.defaultValue = this.props.ticket.type_id;
            let {ticketData} = this.state;
            ticketData.type_id = this.props.ticket.type_id;
            this.setState({ticketData});
            this.setState({types}, ()=>{
                this.setState({isAllStateUpdated: true});
                this.setState({ticketDetailsSpinning: false});
            });
        });

    }

    async getAllStatus() {
        return await (new Api()).call('GET', API_URL + `/getList/statuses?page=*`, [], (new Token()).get());
    }

    async getAllPriorities() {
        return await (new Api()).call('GET', API_URL + `/getList/priorities?page=*`, [], (new Token()).get());
    }

    async getAllTypes() {
        return await (new Api()).call('GET', API_URL + `/getList/types?page=*`, [], (new Token()).get());
    }

    handleSelectOnChange = (target, value) => {
        let {ticketData} = this.state;
        ticketData[target] = value;
        this.setState({ticketData});
    }

    async sendStatusChangeNotice(){
        if( this.state.ticketData.status_id != this.original_status_id ){
            let status = this.state.allStatus.find((status) => status.id === this.state.ticketData.status_id);
            let statusName = '';
            statusName = status ? status.name : 'N/A';
            return await (new Api()).call('POST', API_URL + `/notification/storeNoticeWithUsers`, {ticketId:this.props.ticket.id, note: 'Status of this ticket has been changed to ' + statusName}, (new Token()).get());
        }
    }

    updateTicket(){
        if(this.props.updateTicket(this.state.ticketData)){
            this.sendStatusChangeNotice();
        }
    }

    getStatusHistory(){
        let history = '';
        let _this = this;
        if(this.state.allStausMod){
            this.props.ticket.statusHistory.forEach(function(item, index){
                history += (history != '' ? ' > ' : '');
                history += _this.state.allStausMod[item.id].name + ' (' + (item.crm_user_name ? item.crm_user_name : _this.Helper.getFullName(_this.props.ticket.status_users[item.user_id]) ) + ')'
            })
        }
        return history;
    }

    getComponentToRender(){
        return <>
            <div className="ts-d-ticket-details-main">
                <h6 className="text-capitalize ts-d-ticket-details-header mb-3">Ticket Details</h6>
                <table>
                    <tbody>
                        <tr>
                            <td>Ticket Ref #</td>
                            <td>:</td>
                            <td>{this.props.ticket.id}</td>
                        </tr>

                        <tr>
                            <td>Title</td>
                            <td>:</td>
                            <td title={this.props.ticket.subject}>{this.Helper.truncateWithDot(this.props.ticket.subject, 20)}</td>
                        </tr>

                        {/* <tr>
                            <td>CIF ID</td>
                            <td>:</td>
                            <td title={this.props.ticket.cif_id ?? '-'}>{this.Helper.truncateWithDot(this.props.ticket.cif_id ?? '-', 20)}</td>
                        </tr>

                        <tr>
                            <td>Account</td>
                            <td>:</td>
                            <td title={this.props.ticket.account_no ?? '-'}>{this.Helper.truncateWithDot(this.props.ticket.account_no ?? '-', 20)}</td>
                        </tr>

                        <tr>
                            <td>Card</td>
                            <td>:</td>
                            <td title={this.props.ticket.card_no ?? '-'}>{this.Helper.truncateWithDot(this.props.ticket.card_no ?? '-', 20)}</td>
                        </tr> */}

                        <tr>
                            <td>Contact Name</td>
                            <td>:</td>
                            <td>{this.Helper.truncateWithDot(this.Helper.getFullName(this.props.ticket.contact_user), 25)}</td>
                        </tr>

                        <tr>
                            <td>Created By</td>
                            <td>:</td>
                            <td>{this.props.ticket.crm_user_name && this.props.ticket.crm_user_name!= 'null' ? this.Helper.truncateWithDot(this.props.ticket.crm_user_name, 25) : this.Helper.getFullName(this.props.ticket.create_user)}</td>
                        </tr>

                        <tr>
                            <td>Created</td>
                            <td>:</td>
                            <td>{this.props.ticket.created_at_formed}</td>
                        </tr>

                        <tr>
                            <td>Status</td>
                            <td>:</td>
                            <td>{this.props.ticket.status.name}</td>
                        </tr>

                        <tr>
                            <td>Status <br/> History </td>
                            <td>:</td>
                            <td>{this.getStatusHistory()}</td>
                        </tr>
                    </tbody>
                </table>
                {
                    this.props.ticket.status.slug !== 'closed' && !(new Auth()).isApiUser() ?
                        <NavLink className="text-decoration-none" to={"/ticket-forward/" + this.props.ticket.id}>
                            <button className="btn btn-danger btn-block mt-3">
                                <i className="bi bi-arrow-up-right-circle"></i> Forward Ticket
                            </button>
                        </NavLink>
                    : null
                }

                {
                    /* {
                        this.props.ticket.status.slug !== 'closed' ?
                            <button className="btn btn-danger btn-block mt-3">Close Ticket</button>
                        : null
                    } */
                }
                
                {
                    this.props.ticket.status.slug === 'closed' ?
                        <button className="btn btn-danger btn-block mt-3"
                                onClick={this.props.reopenTicket}
                                disabled = {this.auth.isPermitted('reopen-ticket') ? false : true}
                        >Reopen Ticket</button>
                        : null
                }

            </div>

            <div className="ts-d-ticket-details-update">
                <h6 className="text-capitalize ts-d-ticket-details-header mb-3">Ticket Update</h6>

                <div className="form-group">
                    <label>Status </label>
                    <Select
                        defaultValue = {this.state.status.defaultValue}
                        placeholder  = {"Status"}
                        onChange     = {(value) => this.handleSelectOnChange('status_id', value)}
                        style        = {{width: '100%'}}
                        disabled     = {this.auth.isPermitted('change-ticket-status') ? false : true}
                    >
                        {this.state.status.selectOptions}
                    </Select>
                    {/* <small className="text-danger">{this.state.validationError.status_id}</small> */}
                </div>

                <div className="form-group">
                    <label>Priorities </label>
                    <Select
                        defaultValue={this.state.priorities.defaultValue}
                        placeholder={"Priorities"}
                        onChange={(value) => this.handleSelectOnChange('priority_id', value)}
                        style={{width: '100%'}}
                        disabled = {this.auth.isPermitted('change-ticket-status') ? false : true}
                    >
                        {this.state.priorities.selectOptions}
                    </Select>
                    {/* <small className="text-danger">{this.state.validationError.priority_id}</small> */}
                </div>

                {/* <div className="form-group">
                    <label>Type </label>
                    <Select
                        defaultValue={this.state.types.defaultValue}
                        placeholder={"Type"}
                        onChange={(value) => this.handleSelectOnChange('type_id', value)}
                        style={{width: '100%'}}
                    >
                        {this.state.types.selectOptions}
                    </Select>
                </div> */}
                {
                    this.auth.isPermitted('change-ticket-status') ?
                        <button className="btn btn-danger btn-block mt-3" onClick={this.updateTicket}>Update Ticket</button>
                    : null
                }
            </div>
        </>
    }

    render() {
        return (
            <>
                <div className="col-lg-4 mt-5">
                    <Spin size="medium" spinning={this.state.ticketDetailsSpinning}></Spin>
                    {this.state.isAllStateUpdated ? this.getComponentToRender() : null}
                </div>
            </>
        )
    }
}

export default withRouter(TicketDetails);

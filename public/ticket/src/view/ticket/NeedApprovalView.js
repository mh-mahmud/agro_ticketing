import React, {Component} from 'react';
import DataTable from 'react-data-table-component';
import {Modal, Spin, Select,message} from 'antd';
import Pagination from '../../components/Pagination/Pagination';
import {API_URL,ANTD_MESSAGE_MARGIN_TOP,DELETE_TITLE, NO_DATA_MSG} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Helper from '../../services/Helper';
import ActionButtons from '../../components/common/ActionButtons';
import Auth from '../../services/Auth';
import {withRouter} from "react-router-dom";
import {NavLink} from 'react-router-dom';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {Tooltip} from 'antd';

const { Option }    = Select;
const { confirm }   = Modal;

class NeedApprovalView extends Component {

    constructor() {
        super();
        this.Helper = new Helper();
        this.state = {
            isTableReady        : false,
            pageCount           : 0,
            pageNumber          : 1,
            dataTableSpinning   : false,
            clearSelectedRows   : false,
            tableColumns: [
                {
                    name: 'Subject',
                    selector: row => row.subject
                },
                {
                    name: 'Agent',
                    selector: row => row.agent,
                },
                {
                    name: 'Priority',
                    selector: row => row.priority,
                },
                {
                    name: 'Created At',
                    selector: row => row.created_at_formated,
                },
                {
                    name: 'Action',
                    selector: row => row.action,
                    maxWidth: "200px"
                },
            ],
            tableData: []
        }

        this.selectedRow = [];

        this.handlePageClick             = this.handlePageClick.bind(this);
    }

    async getTickets(page = '') {
        return await (new Api()).call('GET', API_URL + '/ticketsNeedToApprove?page=' + this.state.pageNumber, [], (new Token()).get(),this.params);
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData();
            this.setState({clearSelectedRows: true}); /* If page change then other page selected row will be deselect */
        });
        this.setState({clearSelectedRows: false});
    }

    makeTableData() {
        this.setState({clearSelectedRows: false});
        this.setState({dataTableSpinning: true}, ()=>{
            this.setState({isTableReady: true});
        });
        let query = '';
        let _that = this;
        
        let isEditPermitted     = (new Auth).isPermitted('ticket-edit');
        let isDeletePermitted   = (new Auth).isPermitted('ticket-delete');
        this.getTickets(this.state.pageNumber, query).then((response)=>{
            let {tableData} = this.state;
            tableData = [];
            response.data.collections.data.map((ticket) => {
                tableData.push({
                    ticketId            : ticket.id,
                    subject             : <NavLink to={"/tickets/reply/" + ticket.id}>{ticket.subject}</NavLink>,
                    group               : ticket.group ? ticket.group.name : '-',
                    agent               : ticket.agent_user ? _that.Helper.getFullName(ticket.agent_user) : '-',
                    priority            : ticket.priority ? ticket.priority.name : '-',
                    createdAt           : ticket.created_at,
                    created_at_formated : ticket.created_at_formated,
                    action              : <>
                                            <div>
                                                <ul className="list-inline m-0">
                                                    <li className="list-inline-item">
                                                        <Tooltip title="Messaging">
                                                            <NavLink className="btn btn-primary btn-sm" to={"/tickets/reply/" + ticket.id}>
                                                                <i className="bi bi-chat-right-text"></i>
                                                            </NavLink>
                                                        </Tooltip>
                                                    </li>
                                                    <li className="list-inline-item">
                                                        <Tooltip title="Approve">
                                                            <button 
                                                                onClick={()=>this.approveAction(ticket.id)} 
                                                                className="btn btn-success btn-sm" 
                                                                type="button" 
                                                                data-toggle="tooltip" 
                                                                data-placement="top"
                                                            >
                                                                <i class="bi bi-patch-check-fill"></i>
                                                            </button>
                                                        </Tooltip>
                                                    </li>
                                                    <ActionButtons
                                                        editActionProp      = {()=>this.editAction(ticket.id)}
                                                        deleteActionProp    = {()=>this.deleteAction(ticket.id)}
                                                        isEditPermitted     = {isEditPermitted}
                                                        isDeletePermitted   = {isDeletePermitted}
                                                    />
                                                </ul>
                                            </div>
                                        </>
                });
            });
            this.setState({tableData}, ()=>{
                this.setState({dataTableSpinning: false});
            });
            this.setState({pageCount: response.data.collections.last_page});
        });
    }

    editAction(id){
        this.props.history.push('/edit-ticket/' + id);
    }

    approveAction(id){
        confirm({
            title: 'Are you sure to approve this ticket ?',
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk : async ()=>{
                let response = await (new Api()).call('GET', API_URL + '/ticket/approve/' + id, [], (new Token()).get());
                if (response.data.status_code == 200) {
                    this.makeTableData(this.state.pageNumber);
                   // this.resetModal();
                    message.success({
                        content: 'Successfully Approved.',
                        style: {
                            marginTop: ANTD_MESSAGE_MARGIN_TOP,
                        }
                    });
                } else if (response.data.status_code == 400) {
                    this.setState({submitLoading: false});
                    this.setState({errors: (this.Helper.arrayToErrorMessage(response.data.errors))});
                }
            }
        });
    }

    deleteAction(id){
        confirm({
            title: DELETE_TITLE,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk : async ()=>{
                let response = await (new Api()).call('DELETE', API_URL + '/tickets/' + id, [], (new Token()).get());
                if (response.data.status_code == 200) {
                    this.makeTableData(this.state.pageNumber);
                   // this.resetModal();
                    message.success({
                        content: 'Deleted Successfully.',
                        style: {
                            marginTop: ANTD_MESSAGE_MARGIN_TOP,
                        }
                    });
                } else if (response.data.status_code == 400) {
                    this.setState({submitLoading: false});
                    this.setState({errors: (this.Helper.arrayToErrorMessage(response.data.errors))});
                }
            }
        });
    }

    handleSearch = value =>
    {
        this.makeTableData('',value);
    }

    onHandleSelect = value => {
        this.makeTableData('',value);
    }

    componentDidMount(){
        this.makeTableData();
    }

    renderTable(){
        return <>
            <div className="ts-d-open-ticket-area mt-4">
                <div className="ts-d-open-ticket-col">
                    <div className="ts-d-open-ticket-table-area">
                        <div className="ts-d-open-ticket-table-main">
                            <div className="ts-table-header">
                                <p className="ts-components-title text-uppercase">Need Approval</p>
                                <span><i className="bi bi-three-dots-vertical"> </i></span>
                            </div>
                            <DataTable
                                // selectableRows
                                clearSelectedRows={this.state.clearSelectedRows}
                                onSelectedRowsChange={this.handleCheckboxChange}
                                columns={this.state.tableColumns}
                                data={this.state.tableData}
                                noDataComponent={this.state.dataTableSpinning ? <Spin size="medium" tip="Getting Data..." spinning={this.state.dataTableSpinning}></Spin> : NO_DATA_MSG}
                                striped={true}
                                highlightOnHover={true}
                            />
                        </div>

                        {/*Pagination*/}
                        {this.state.pageCount > 1 ? <Pagination pageCount={this.state.pageCount} handlePageClick={this.handlePageClick}/> : null}
                    </div>

                </div>

            </div>
        </>
    }

    render() {
        return (
            <>
                {this.state.isTableReady ? this.renderTable() : null}
            </>
        )
    }
}
export default withRouter(NeedApprovalView);

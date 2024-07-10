/* eslint-disable default-case */
import React, {Component} from 'react';
import DataTable from 'react-data-table-component';
import Pagination from '../../../components/Pagination/Pagination';
import {Spin,Menu, Dropdown, Alert} from 'antd';
import {API_URL} from "../../../Config";
import Api from '../../../services/Api';
import Token from '../../../services/Token';
import Helper from '../../../services/Helper';
import {withRouter} from "react-router-dom";
import {NavLink} from 'react-router-dom';
import Layout from "../../../components/common/Layout";
import Form from './Form';
import TicketService from '../../../services/TicketService';

class StatusReport extends Component {
    constructor() {
        super();
        this.Helper = new Helper();
        this.state = {
            isTableReady: false,
            pageCount: 0,
            pageNumber: 1,
            dataTableSpinning: false,
            clearSelectedRows: false,
            errorMsg: null,
            tableColumns: [
                {
                    name: 'ID',
                    selector: row => row.ticketId
                },
                {
                    name: 'Title',
                    selector: row => row.subject
                },
                {
                    name: 'Type',
                    selector: row => row.type
                },
                // {
                //     name: 'Agent',
                //     selector: row => row.agent,
                // },
                {
                    name: 'Group',
                    selector: row => row.group,
                },
                {
                    name: 'Priority',
                    selector: row => row.priority,
                },
                {
                    name: 'Source',
                    selector: row => row.source,
                },
                {
                    name: 'Created At',
                    selector: row => row.createdAt,
                },
                {
                    name: 'Status',
                    selector: row => row.status,
                },
            ],

            searchFormData: {
                start_date: null,
                end_date: null,               
                status_id: '',
            },

            tableData: []
        }

        this.selectedRow = [];

        this.handlePageClick        = this.handlePageClick.bind(this);
        this.statusChangeHandler      = this.statusChangeHandler.bind(this);
        this.handleCheckboxChange   = this.handleCheckboxChange.bind(this);
        this.searchTicketByField    = this.searchTicketByField.bind(this);
        this.dateOnchange           = this.dateOnchange.bind(this);
    }

    async getReportData(query = '') {
        return await (new Api()).call('GET', API_URL + '/statusReportDateWise?page=' + this.state.pageNumber + query, [], (new Token()).get());
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData();
            this.setState({clearSelectedRows: true}); /* If page change then other page selected row will be deselect */
        });
        this.setState({clearSelectedRows: false});
    }

    handleCheckboxChange(selectedRow) {
        this.selectedRow = [];

        if (selectedRow.selectedCount) {
            selectedRow.selectedRows.forEach((row, key) => {
                this.selectedRow.push(row.ticketId);
            });
            this.setState({bulkActionView: true});
        } else {
            this.setState({bulkActionView: false});
        }
    }

    makeTableData() {

        this.setState({errorMsg: null});
        this.setState({clearSelectedRows: false});
        this.setState({dataTableSpinning: true}, () => {
            this.setState({isTableReady: true});
        });
        let query = '';
        query += this.state.searchFormData.status_id ? `&status_id=${this.state.searchFormData.status_id}` : '';
        query += this.state.searchFormData.start_date ? `&start_date=${this.state.searchFormData.start_date}` : '';
        query += this.state.searchFormData.end_date ? `&end_date=${this.state.searchFormData.end_date}` : '';
        
        this.getReportData(query).then((response) => {
            
            let {tableData} = this.state;
            tableData = [];
            let TICKET_SERVICE = new TicketService();
            switch(response.data.status) {
                case 200:// Success
                    response.data.collections.data.map((ticket) => {
                        tableData.push({
                            ticketId: ticket.id,
                            source_id: ticket.source ? ticket.source.id : '-',
                            subject: <NavLink to={"/tickets/reply/" + ticket.id}>{ticket.subject}</NavLink>,
                            group: ticket.group ? ticket.group.name : '-',
                            type: ticket.type ? ticket.type.name : '-',
                            agent: ticket.agent_user ? this.Helper.getFullName(ticket.agent_user) : '-',
                            priority: ticket.priority ? ticket.priority.name : '-',
                            source: ticket.source ? ticket.source.name : '-',
                            status: <div className="ts-status-area">
                                        {
                                            ticket.status.name + "-" + (ticket.forward_tickets ? ticket.forward_tickets.group.name : ticket.group.name) + (ticket.forward_tickets !== null ? " (Forwarded)" : '')
                                        }
                                    </div>,
                            createdAt: ticket.created_at_formated,
        
                        });
                    });
                    this.setState({pageCount: response.data.collections.last_page});
                break;
                case 400:// Error
                    this.setState({errorMsg: (new Helper).arrayToErrorMessage(response.data.errors)});
                break;
            }
            
            this.setState({tableData}, () => {
                this.setState({dataTableSpinning: false});
            });
        });
    }


    handleSearch = value => {
        this.makeTableData('', value);
    }

    onHandleSelect = value => {
        this.makeTableData('', value);
    }

    componentDidMount() {
        this.makeTableData();
    }

    onChangeHandler = (event, key) => {
        const {searchFormData} = this.state;
        searchFormData[event.target.name] = event.target.value;
        this.setState({searchFormData});
    }

    statusChangeHandler(value) {
        const {searchFormData} = this.state;
        searchFormData.status_id = value;
        this.setState({searchFormData})
    }

    searchTicketByField() {
        this.setState({pageCount: 1});
        let {searchFormData} = this.state;
        this.makeTableData();
        this.setState({searchFormData})
    }

    dateOnchange(dateString, target){
        let {searchFormData} = this.state;
        searchFormData[target] = dateString;
        this.setState({searchFormData});
    }

    handleSelectOnChange = (target, value) => {
        let {searchFormData} = this.state;
        searchFormData[target] = value;
        this.setState({searchFormData});
    }

    renderTable() {
        return (
            <Layout>

                <Form onChangeHandler       ={this.onChangeHandler}
                      statusChangeHandler     ={this.statusChangeHandler}
                      searchTicketByField   ={this.searchTicketByField}
                      searchFormData        ={this.state.searchFormData}
                      dateOnchange          ={this.dateOnchange}
                />
                {
                    this.state.errorMsg != null ?
                        <Alert
                            message="Something Wrong !"
                            description= {this.state.errorMsg}
                            type="error"
                            closable
                        />
                    : null
                }

                <div className="ts-d-open-ticket-area mt-4">
                    <div className="ts-d-open-ticket-col">
                        <div className="ts-d-open-ticket-table-area">
                            <div className="ts-d-open-ticket-table-main">
                                <div className="ts-table-header">
                                    <p className="ts-components-title text-uppercase">ALL TICKET LIST</p>
                                    <span>
                                        <Dropdown
                                            overlay={
                                                <Menu>
                                                    <Menu.Item key="1">
                                                        <a download href={API_URL + "/statusReportDateWiseDownload/csv?status_id=" + this.state.searchFormData.status_id + "&start_date=" + this.state.searchFormData.start_date + "&end_date=" + this.state.searchFormData.end_date + "&page=*&access_token=" + (new Token()).get()}><span><i className="bi bi-file-earmark-spreadsheet"></i><small>Download CSV</small></span></a>
                                                    </Menu.Item>
                                                </Menu>
                                            }
                                            trigger={['click']}
                                            placement={"bottomLeft"}
                                        >
                                            <i className="bi bi-three-dots-vertical"> </i>
                                        </Dropdown>
                                     </span>
                                </div>

                                <DataTable
                                    // selectableRows
                                    clearSelectedRows={this.state.clearSelectedRows}
                                    onSelectedRowsChange={this.handleCheckboxChange}
                                    columns={this.state.tableColumns}
                                    data={this.state.tableData}
                                    noDataComponent={<Spin size="medium" tip="Getting Data..."
                                                           spinning={this.state.dataTableSpinning}></Spin>}
                                    striped={true}
                                    highlightOnHover={true}
                                />
                            </div>
                            {/*Pagination*/}
                            <Pagination pageCount={this.state.pageCount} handlePageClick={this.handlePageClick}/>
                        </div>


                    </div>

                </div>
                {/*End Source Table*/}

            </Layout>
        )
    }

    render() {
        return (
            <>
                {this.state.isTableReady ? this.renderTable() : null}
            </>
        )
    }

}

export default withRouter(StatusReport);

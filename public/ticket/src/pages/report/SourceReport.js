import React, {Component} from 'react';
import DataTable from 'react-data-table-component';
import Pagination from '../../components/Pagination/Pagination';
import {Modal, Spin, Select, message, Menu, Dropdown} from 'antd';
import {API_URL, ANTD_MESSAGE_MARGIN_TOP, DELETE_TITLE} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Helper from '../../services/Helper';
import ActionButtons from '../../components/common/ActionButtons';
import Auth from '../../services/Auth';
import {withRouter} from "react-router-dom";
import {NavLink} from 'react-router-dom';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {Tooltip} from 'antd';
import Layout from "../../components/common/Layout";
import Form from './Form';
import {DatePicker} from 'antd';
import TicketService from '../../services/TicketService';

const {Option} = Select;
const {confirm} = Modal;

class SourceReport extends Component {
    constructor() {
        super();
        this.Helper = new Helper();
        this.state = {
            isTableReady: false,
            pageCount: 0,
            pageNumber: 1,
            dataTableSpinning: false,
            clearSelectedRows: false,
            tableColumns: [
                {
                    name: 'Subject',
                    selector: row => row.subject
                },
                {
                    name: 'Type',
                    selector: row => row.type
                },


                {
                    name: 'Agent',
                    selector: row => row.agent,
                },
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

                source_id: '',
                // created_at: ''
            },

            tableData: []
        }

        this.tableMenu = (
            <Menu>
                {/* <Menu.Item key="0">
                    <span><i className="bi bi-printer"> </i> <small>Print</small></span>
                </Menu.Item> */}
                <Menu.Item key="1">
                    <a doenload href="http://localhost:8000/"><span><i className="bi bi-file-earmark-spreadsheet"> </i> <small>Download CSV</small></span></a>
                </Menu.Item>
            </Menu>
        );

        this.selectedRow = [];

        this.handlePageClick        = this.handlePageClick.bind(this);
        this.sourceChangeHandler    = this.sourceChangeHandler.bind(this);
        this.handleCheckboxChange   = this.handleCheckboxChange.bind(this);
        this.searchTicketByField    = this.searchTicketByField.bind(this);
    }

    async getTickets(page = '', query = '') {
        if (query == null) {
            return await (new Api()).call('GET', API_URL + '/tickets?page=' + this.state.pageNumber, [], (new Token()).get(), this.params);
        } else {
            return await (new Api()).call('GET', API_URL + '/tickets?page=' + this.state.pageNumber + query, [], (new Token()).get());
        }
    }

    async getAllSource() {
        return await (new Api()).call('GET', API_URL + `/getList/sources?page=*`, [], (new Token()).get());
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

        this.setState({clearSelectedRows: false});
        this.setState({dataTableSpinning: true}, () => {
            this.setState({isTableReady: true});
        });
        let query = '';
        let _that = this;
        if (_that.state.searchFormData) {
            // query = `&subject=${_that.state.searchFormData.subject}&contact_id=${_that.state.searchFormData.contact_id}&group_id=${_that.state.searchFormData.group_id}&agent_id=${_that.state.searchFormData.agent_id}&status_id=${_that.state.searchFormData.status_id}&priority_id=${_that.state.searchFormData.priority_id}&type_id=${_that.state.searchFormData.type_id}&source_id=${_that.state.searchFormData.source_id}`
            query = `&source_id=${_that.state.searchFormData.source_id}`
        }

        let isEditPermitted = (new Auth).isPermitted('ticket-edit');
        let isDeletePermitted = (new Auth).isPermitted('ticket-delete');
        //alert('sds');
        this.getTickets(this.state.pageNumber, query).then((response) => {

            let {tableData} = this.state;
            tableData = [];
            let TICKET_SERVICE = new TicketService();
            response.data.collections.data.map((ticket) => {
                tableData.push({
                    ticketId: ticket.id,
                    source_id: ticket.source.id,
                    subject: <NavLink to={"/tickets/reply/" + ticket.id}>{ticket.subject}</NavLink>,
                    group: ticket.group ? ticket.group.name : '-',
                    //forward_tickets: ticket.forward_tickets ? ticket.forward_tickets: '',
                    type: ticket.type ? ticket.type.name : '-',
                    agent: ticket.agent_user ? _that.Helper.getFullName(ticket.agent_user) : '-',
                    priority: ticket.priority ? ticket.priority.name : '-',
                    source: ticket.source ? ticket.source.name : '-',
                    // priority: <div className="">{ticket.priority ? ticket.priority.name : '-'}</div>,
                    status: <div className="ts-status-area">
                        {
                            TICKET_SERVICE.generateStatus(ticket.status, ticket.group, ticket.forward_tickets ? ticket.forward_tickets.group : null, ticket.type ? ticket.type : null, ticket.updated_at, ticket.forward_tickets ? ticket.forward_tickets : null,)
                        }
                    </div>,
                    createdAt: ticket.created_at_formated,

                });
            });
            this.setState({tableData}, () => {
                this.setState({dataTableSpinning: false});
            });
            this.setState({pageCount: response.data.collections.last_page});
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

    sourceChangeHandler(value) {
        const {searchFormData} = this.state;
        searchFormData.source_id = value;
        this.setState({searchFormData})
    }

    searchTicketByField() {
        let {searchFormData} = this.state;

        this.makeTableData()


        this.setState({searchFormData}, () => {
            console.log(this.state.searchFormData)
        })
    }

    handleSelectOnChange = (target, value) => {
        let {searchFormData} = this.state;
        searchFormData[target] = value;
        this.setState({searchFormData});
    }


    renderTable() {
        return (
            <Layout>

                <Form onChangeHandler={this.onChangeHandler}
                      sourceChangeHandler={this.sourceChangeHandler}
                      searchTicketByField={this.searchTicketByField}
                      searchFormData={this.state.searchFormData}/>


                <div className="ts-d-open-ticket-area mt-4">
                    <div className="ts-d-open-ticket-col">
                        <div className="ts-d-open-ticket-table-area">
                            <div className="ts-d-open-ticket-table-main">
                                <div className="ts-table-header">
                                    <p className="ts-components-title text-uppercase">ALL TICKET LIST</p>
                                    <span>
                                        <Dropdown
                                            overlay={this.tableMenu}
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

export default withRouter(SourceReport);

import React, {Component} from 'react';
import DataTable from 'react-data-table-component';
import {Modal, Spin, Select, message, DatePicker, Menu, Dropdown} from 'antd';
import Pagination from '../../components/Pagination/Pagination';
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
import TicketService from '../../services/TicketService';
import moment from 'moment';

const {Option} = Select;
const {confirm} = Modal;

class TicketList extends Component {

    constructor() {
        super();
        this.Helper = new Helper();
        this.toggleClass = this.toggleClass.bind(this);
        this.state = {
            isTableReady: false,
            pageCount: 0,
            pageNumber: 1,
            dataTableSpinning: false,
            clearSelectedRows: false,
            active:true,
            tableColumns: [
                {
                    name: 'ID',
                    selector: row => row.ticketId
                },
                {
                    name: 'Customer ID',
                    selector: row => row.customer_id
                },
                {
                    name: 'Customer Name',
                    selector: row => row.customer_name
                },
                {
                    name: 'Mobile',
                    selector: row => row.mobile
                },
                {
                    name: 'Category',
                    selector: row => row.type
                },
                {
                    name: 'Sub Category',
                    selector: row => row.sub_type
                },
                /* {
                    name: 'Title',
                    selector: row => row.subject
                }, */
                // {
                //     name: 'Group',
                //     selector: row => row.forward_tickets,
                // },
                // {
                //     name: 'Agent',
                //     selector: row => row.agent,
                // },
                /* {
                    name: 'Group',
                    selector: row => row.group,
                }, */
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
                {
                    name: 'Action',
                    selector: row => row.action,
                    maxWidth: "160px"
                },
            ],
            groups: {
                selectOptions: [],
                defaultValue: null
            },

            contacts: {
                selectOptions: [],
                defaultValue: null,
                notFoundMessage: 'Type name or mobile'
            },

            agents: {
                selectOptions: [],
                defaultValue: null,
                notFoundMessage: 'Type name or mobile'
            },

            statuses: {
                selectOptions: [],
                defaultValue: 0
            },

            priorities: {
                selectOptions: [],
                defaultValue: 0
            },

            types: {
                selectOptions: [],
                defaultValue: 0
            },
            subTypes: {
                selectOptions: [],
                defaultValue: 0,
                value: null
            },

            source: {
                selectOptions: [],
                defaultValue: 0
            },

            searchFormData: {
                subject: '',
                account_no: '',
                card_no: '',
                id: '',
                agent_id: '',
                contact_id: '',
                group_id: '',
                status_id: '',
                priority_id: '',
                type_id: '',
                sub_type_id: '',
                created_at: '',
                source_id: '',
                from_date: '',
                to_date: ''
            },
            tableData: [],
            fromDate: '',
            toDate: ''
        }

        this.selectedRow = [];

        this.handlePageClick        = this.handlePageClick.bind(this);
        this.groupChangeHandler     = this.groupChangeHandler.bind(this);
        this.statusChangeHandler    = this.statusChangeHandler.bind(this);
        this.priorityChangeHandler  = this.priorityChangeHandler.bind(this);
        this.typeChangeHandler      = this.typeChangeHandler.bind(this);
        this.sourceChangeHandler    = this.sourceChangeHandler.bind(this);
        this.getAndSetAgentOptions  = this.getAndSetAgentOptions.bind(this);
        this.handleCheckboxChange   = this.handleCheckboxChange.bind(this);
        this.dateOnChange           = this.dateOnChange.bind(this);
        this.fromDateOnChange       = this.fromDateOnChange.bind(this);
        this.toDateOnChange         = this.toDateOnChange.bind(this);
    }

    toggleClass() {
        const currentState = this.state.active;
        this.setState({active: !currentState});
    }

    async getTickets(page = '', query = '') {
        if (query == null) {
            return await (new Api()).call('GET', API_URL + '/tickets?page=' + this.state.pageNumber, [], (new Token()).get(), this.params);
        } else {
            return await (new Api()).call('GET', API_URL + '/tickets?page=' + this.state.pageNumber + query, [], (new Token()).get());
        }
        // return await (new Api()).call('GET', API_URL + '/tickets?page=' + this.state.pageNumber, [], (new Token()).get());
    }

    async getAllGroups() {
        return await (new Api()).call('GET', API_URL + `/getList/groups?page=*`, [], (new Token()).get());
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

    async getAllSource() {
        return await (new Api()).call('GET', API_URL + `/getList/sources?page=*`, [], (new Token()).get());
    }

    async getAndSetAgentOptions(query, callback) {
        if (this.state.timeout) {
            clearTimeout(this.state.timeout);
            this.state.timeout = null;
        }
        let {agents} = this.state;
        let selectOptions = [];
        let _this = this;

        // Reset
        agents.selectOptions = [];
        agents.notFoundMessage = 'Searching...';
        callback(agents);

        async function call() {
            let response = await (new Api()).call('POST', API_URL + `/user/search?query=` + query, [], (new Token()).get());
            response.data.listing.map((agents) => {
                let full_name = _this.Helper.getFullName(agents);
                selectOptions.push(<Option
                    value={agents.id}
                    key={agents.id}
                >
                    <div className="demo-option-label-item">
                        <i className="bi bi-person-circle"> </i>
                        <strong> {full_name} </strong> <br/> {agents.email}
                        {/*{full_name}*/}
                    </div>
                </Option>);
            });
            agents.selectOptions = selectOptions;
            agents.notFoundMessage = 'Not Found!';
            callback(agents);
        }

        this.state.timeout = setTimeout(call, 500);
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
        console.log(this.selectedRow);
    }

    makeTableData() {
        this.setState({clearSelectedRows: false});
        this.setState({dataTableSpinning: true}, () => {
            this.setState({isTableReady: true});
        });
        if(!this.state.searchFormData.from_date && !this.state.searchFormData.to_date) {      
            this.state.fromDate = moment().subtract(31, "days").format("DD-MM-YYYY");
            this.state.toDate = moment(new Date()).format("DD-MM-YYYY");

        } else {
            this.state.fromDate = moment(this.state.searchFormData.from_date).format("DD-MM-YYYY");
            this.state.toDate = moment(this.state.searchFormData.to_date).format("DD-MM-YYYY");

        }
        let query = '';
        let _that = this;
        if (_that.state.searchFormData) {
            query = `&created_at=${_that.state.searchFormData.created_at}&id=${_that.state.searchFormData.id}&subject=${_that.state.searchFormData.subject}&contact_id=${_that.state.searchFormData.contact_id}&group_id=${_that.state.searchFormData.group_id}&agent_id=${_that.state.searchFormData.agent_id}&status_id=${_that.state.searchFormData.status_id}&priority_id=${_that.state.searchFormData.priority_id}&type_id=${_that.state.searchFormData.type_id}&source_id=${_that.state.searchFormData.source_id}&from_date=${_that.state.searchFormData.from_date}&to_date=${_that.state.searchFormData.to_date}`
        }

        let isEditPermitted = (new Auth).isPermitted('ticket-edit');
        let isDeletePermitted = (new Auth).isPermitted('ticket-delete');
        this.getTickets(this.state.pageNumber, query).then((response) => {

            let {tableData} = this.state;
            tableData = [];
            let TICKET_SERVICE = new TicketService();
            response.data.collections.data.map((ticket) => {
                tableData.push({
                    ticketId: <span title={ticket.id}>{ticket.id}</span>,
                    customer_name: <span title={typeof ticket.contact_user.first_name !== undefined ? ticket.contact_user.first_name : ''}>{typeof ticket.contact_user.first_name !== undefined ? ticket.contact_user.first_name : ''}</span>,
                    customer_id: <span title={ticket.contact_user.cif_id !== undefined ? ticket.contact_user.cif_id : ''}>{ticket.contact_user.cif_id !== undefined ? ticket.contact_user.cif_id : ''}</span>,

                    mobile: <span title={ticket.contact_user.mobile !== undefined ? ticket.contact_user.mobile : ''}>{ticket.contact_user.mobile !== undefined ? ticket.contact_user.mobile : ''}</span>,
                    // account_no: <span title={ticket.account_no ?? "-"}>{ticket.account_no ?? '-'}</span>,
                    // card_no: <span title={ticket.card_no ?? "-"}>{ticket.card_no ?? "-"}</span>,
                    // cif_id: <span title={ticket.cif_id ?? "-"}>{ticket.cif_id ?? "-"}</span>,
                    subject: <NavLink to={"/tickets/reply/" + ticket.id}><span title={ticket.subject}>{ticket.subject}</span></NavLink>,
                    group: ticket.group ? <span title={ticket.group.name}>{ticket.group.name}</span> : '-',
                    //forward_tickets: ticket.forward_tickets ? ticket.forward_tickets: '',
                    type: ticket.type.parent ? <span title={ticket.type.parent.name}>{ticket.type.parent.name}</span> : <span title={ticket.type.name}>{ticket.type.name}</span>,
                    sub_type: ticket.type.parent ? <span title={ticket.type.name}>{ticket.type.name}</span> : '-',
                    agent: ticket.agent_user ? _that.Helper.getFullName(ticket.agent_user) : '-',
                    priority: ticket.priority ? <span title={ticket.priority.name}>{ticket.priority.name}</span> : '-',
                    source: ticket.source ? <span title={ticket.source.name}>{ticket.source.name}</span> : '-',
                    // priority: <div className="">{ticket.priority ? ticket.priority.name : '-'}</div>,
                    status: <div className="ts-status-area">
                                {
                                    TICKET_SERVICE.generateStatus(ticket.slaCalculated, ticket.status, ticket.group, ticket.forward_tickets ? ticket.forward_tickets.group : null, ticket.forward_tickets ? ticket.forward_tickets : null)
                                }
                            </div>,
                    status_string: ticket.status.slug,
                    createdAt: <span title={ticket.created_at_formated}>{ticket.created_at_formated}</span>,
                    //created_at: <span title={ticket.created_at}>{ticket.created_at}</span>,
                    action: <>
                        <div>
                            <ul className="list-inline m-0">
                                {
                                    (new Auth).isPermitted('ticket-reply') ?
                                        <li className="list-inline-item">
                                            <Tooltip title="Resolution">
                                                <NavLink className="btn btn-primary btn-sm" to={"/tickets/reply/" + ticket.id}>
                                                    <i className="bi bi-chat-right-text"></i>
                                                </NavLink>
                                            </Tooltip>
                                        </li>
                                    : null
                                }
                                <ActionButtons
                                    editActionProp={() => this.editAction(ticket.id)}
                                    deleteActionProp={() => this.deleteAction(ticket.id)}
                                    isEditPermitted={isEditPermitted}
                                    isDeletePermitted={isDeletePermitted}
                                />
                            </ul>
                        </div>
                    </>
                });
            });
            this.setState({tableData}, () => {
                this.setState({dataTableSpinning: false});
            });
            this.setState({pageCount: response.data.collections.last_page});
        });
    }

    editAction(id) {
        this.props.history.push('/edit-ticket/' + id);
    }

    deleteAction(id) {
        confirm({
            title: DELETE_TITLE,
            icon: <ExclamationCircleOutlined/>,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                let response = await (new Api()).call('DELETE', API_URL + '/tickets/' + id, [], (new Token()).get());
                if (response.data.status_code == 200) {
                    this.makeTableData(this.state.pageNumber);
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

    handleSearch = value => {
        this.makeTableData('', value);
    }

    onHandleSelect = value => {
        this.makeTableData('', value);
    }

    componentDidMount() {
        this.makeTableData();

        //groups
        let allGroups = this.getAllGroups();
        allGroups.then((response) => {
            let {groups} = this.state;
            let {selectOptions} = groups;
            selectOptions = []; // Reset
            response.data.group_list.map((group) => {
                selectOptions.push(<Option
                    key={group.id}
                    value={group.id}
                >
                    {group.name}
                </Option>);
            });
            groups.selectOptions = selectOptions;
            this.setState({groups});
        });
        //agent

        //status
        let allStatus = this.getAllStatus();
        allStatus.then((response) => {
            // console.log(response.data.collections)
            let {statuses} = this.state;
            let {selectOptions} = statuses;
            selectOptions = []; // Reset
            response.data.collections.map((item) => {
                selectOptions.push(<Option
                    key={item.id}
                    value={item.id}
                >
                    {item.name}
                </Option>);
            });
            statuses.selectOptions = selectOptions;
            this.setState({statuses});
        });
        //all priority select
        let allPriority = this.getAllPriorities();
        allPriority.then((response) => {
            // console.log(response.data.collections)
            let {priorities} = this.state;
            let {selectOptions} = priorities;
            selectOptions = []; // Reset
            response.data.collections.map((item) => {
                selectOptions.push(<Option
                    key={item.id}
                    value={item.id}
                >
                    {item.name}
                </Option>);
            });
            priorities.selectOptions = selectOptions;
            this.setState({priorities});
        });
        //types
        let allTypes = this.getAllTypes();
        allTypes.then((response) => {
            // console.log(response.data)
            let {types} = this.state;
            let {selectOptions} = types;
            selectOptions = []; // Reset
            response.data.collections.map((item) => {
                selectOptions.push(<Option
                    key={item.id}
                    value={item.id}
                >
                    {item.name}
                </Option>);
            });
            types.selectOptions = selectOptions;
            this.setState({types});
        });
        //source
        let allSource = this.getAllSource();
        allSource.then((response) => {
            let {source} = this.state;
            let {selectOptions} = source;
            selectOptions = []; // Reset
            response.data.collections.map((item) => {
                selectOptions.push(<Option
                    key={item.id}
                    value={item.id}
                >
                    {item.name}
                </Option>);
            });
            source.selectOptions = selectOptions;
            this.setState({source});
        });
    }

    onChangeHandler = (event, key) => {
        const {searchFormData} = this.state;
        searchFormData[event.target.name] = event.target.value;
        this.setState({searchFormData});
    }

    dateOnChange(value,date) {
        //console.log(created_at);
        const {searchFormData} = this.state;
        searchFormData.created_at = date;
        this.setState({searchFormData});
    }
    fromDateOnChange(value,date) {
        //console.log(created_at);
        const {searchFormData} = this.state;
        this.state.searchFormData.from_date = date;
        this.setState({searchFormData});
    }
    toDateOnChange(value,date) {
        //console.log(created_at);
        const {searchFormData} = this.state;
        searchFormData.to_date = date;
        this.setState({searchFormData});
    }
    handleAgentSearch = query => {
        let {searchFormData} = this.state
        if (query.length > 0) {
            this.getAndSetAgentOptions(query, agents => this.setState({agents}));
        } else {
            searchFormData.agent_id = [];
            this.setState({searchFormData});
        }
    }

    handleContactSearch = query => {
        let {searchFormData} = this.state
        if (query.length > 0) {
            this.getAndSetAgentOptions(query, contacts => this.setState({contacts}));
        } else {
            searchFormData.contact_id = [];
            this.setState({searchFormData});
        }
    }

    groupChangeHandler(value) {
        const {searchFormData} = this.state;
        searchFormData.group_id = value;
        this.setState({searchFormData}, () => {
            console.log(this.state.searchFormData)
        })
    }

    statusChangeHandler(value) {
        const {searchFormData} = this.state;
        searchFormData.status_id = value;
        this.setState({searchFormData})
    }

    priorityChangeHandler(value) {
        const {searchFormData} = this.state;
        searchFormData.priority_id = value;
        this.setState({searchFormData})
    }

    typeChangeHandler(value) {
        const {searchFormData} = this.state;
        searchFormData.type_id = value;
        this.setState({searchFormData})
    }

    sourceChangeHandler(value) {
        const {searchFormData} = this.state;
        searchFormData.source_id = value;
        this.setState({searchFormData})
    }

    searchTicketByField() {
        let {searchFormData} = this.state;
        this.makeTableData()

        // searchFormData.subject      = ''
        // searchFormData.group_id     = ''
        // searchFormData.priority_id  = ''
        // searchFormData.status_id    = ''
        // searchFormData.type_id      = ''
        // searchFormData.agent_id     = ''
        // searchFormData.source_id    = ''
        // searchFormData.contact_id   = ''


        this.setState({searchFormData}, () => {
            console.log(this.state.searchFormData)
        })
    }

    async getSubTypes(type_id) {

        return await (new Api()).call('GET', API_URL + '/getList/sub-types/' + type_id, [], (new Token()).get());

    }

    handleSelectOnChange = (target, value) => {
        let {searchFormData} = this.state;
        searchFormData[target] = value;
        let {subTypes} = this.state;
        switch (target) {
            // Get sub type
            case "type_id":
                subTypes.value = null;
                searchFormData.type_id = value;
                // reset others value
                searchFormData.sub_type_id = '';
                this.getAndSetSubTypes(value);
                break;
            case "sub_type_id":
                searchFormData.type_id = value;
                subTypes.value = value;
                this.setState({subTypes});
                break;
            
        }
        this.setState({searchFormData});
    }

    getAndSetSubTypes(type_id) {
        let sub_types = this.getSubTypes(type_id);
        sub_types.then((response) => {
            let {subTypes} = this.state;
            let {selectOptions} = subTypes;
            selectOptions = []; // Reset
            response.data.collections.data.map((type) => {
                selectOptions.push(<Option
                    key={type.id}
                    value={type.id}
                >
                    {type.name}
                </Option>);
            });
            subTypes.selectOptions = selectOptions;
            this.setState({subTypes});
        });
    }

    conditionalRowStyles(row){
        switch (row.status_string) {
            case 'resolved':
                return '#baffba'; // Green
                break;
            case 'raised':
                return '#ffffa7'; // Yellow
                break;
            case 'closed':
                return '#ffffff'; // White
                break;
            case 'open':
                return '#d4fbff'; // Blue
                break;
            case 'pending':
                return '#ffc6c6'; // Red
                break;
        
            default:
                return '#e5e5e5'; // Gray
                break;
        }
    }
    renderTable() {
        return <>
            <div className="ts-d-open-ticket-area mt-4">
                <div className="ts-d-open-ticket-col">
                    <div className="ts-d-open-ticket-table-area">
                        <div className="ts-d-open-ticket-table-main">
                            <div className="ts-table-header">
                                <p className="ts-components-title text-uppercase">ALL TICKET LIST FROM {this.state.fromDate} TO {this.state.toDate}</p>
                                <div className='d-flex'>
                                <span>
                                        <Dropdown
                                            overlay={
                                                <Menu>
                                                    <Menu.Item key="1">
                                                        <a download href={API_URL + "/ticketDownloadCsv?from_date=" + this.state.searchFormData.from_date + "&to_date=" + this.state.searchFormData.to_date + "&subject=" + this.state.searchFormData.subject +"&id=" + this.state.searchFormData.id +"&agent_id=" + this.state.searchFormData.agent_id +"&contact_id=" + this.state.searchFormData.contact_id +"&group_id=" + this.state.searchFormData.group_id +"&status_id=" + this.state.searchFormData.status_id +"&priority_id=" + this.state.searchFormData.priority_id +"&type_id=" + this.state.searchFormData.type_id +"&sub_type_id=" + this.state.searchFormData.sub_type_id +"&created_at=" + this.state.searchFormData.created_at  +"&source_id=" + this.state.searchFormData.source_id + "&page=*&access_token=" + (new Token()).get()}><span><i className="bi bi-file-earmark-spreadsheet"></i><small>Download CSV</small></span></a>
                                                    </Menu.Item>
                                                </Menu>
                                            }
                                            trigger={['click']}
                                            placement={"bottomLeft"}
                                        >
                                            <i className="bi bi-three-dots-vertical"> </i>
                                        </Dropdown>
                                     </span>
                                <button className={"btn btn-sm btn-info"} onClick={this.toggleClass}>
                                    <i className="bi bi-filter"></i> Filter
                                </button>
                                </div>
                               
                            </div>

                            {/*Toolbar*/}
                            {/* <div className="ml-auto mb-3">
                                <div className="ts-d-notification-table-toolbar">
                                     <button className="btn btn-outline-info btn-sm"><i className="bi bi-forward"> </i> Forward</button>
                                    <button className="btn btn-outline-info btn-sm"><i className="bi bi-x-square"> </i> Close</button>
                                    <button className="btn btn-outline-danger btn-sm"><i className="bi bi-trash"> </i> Delete</button>
                                </div>
                            </div> */}
                            {/*End Toolbar*/}
                            <DataTable
                                // selectableRows
                                clearSelectedRows={this.state.clearSelectedRows}
                                onSelectedRowsChange={this.handleCheckboxChange}
                                columns={this.state.tableColumns}
                                data={this.state.tableData}
                                noDataComponent={<Spin size="medium" tip="Getting Data..." spinning={this.state.dataTableSpinning}></Spin>}
                                striped={true}
                                highlightOnHover={true}
                                conditionalRowStyles={[
                                    {
                                      when: (row) => true,
                                      style: (row) => ({
                                        backgroundColor: this.conditionalRowStyles(row),
                                      }),
                                    },
                                  ]}
                            />
                        </div>

                        {/*Pagination*/}
                        <Pagination pageCount={this.state.pageCount} handlePageClick={this.handlePageClick}/>
                    </div>

                    {/*Table Filter*/}
                    <div className={this.state.active ? 'ts-d-table-search-filter add-filter': 'ts-d-table-search-filter'}>
                        <div className="ts-table-header">
                            <p className="ts-components-title text-uppercase">Filter</p>
                            <span>
                                <i className="bi bi-three-dots-vertical"> </i>
                            </span>
                        </div>
                        {/* <div className="ts-d-table-s-f-main">
                            <div className="ts-d-table-search mb-2">
                                <label>Account No: </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="account_no"
                                    name="account_no"
                                    placeholder="Search by Account No"
                                    value={this.state.searchFormData.account_no}
                                    onChange={this.onChangeHandler}
                                />
                            </div>
                        </div>
                        <div className="ts-d-table-s-f-main">
                            <div className="ts-d-table-search mb-2">
                                <label>Card No: </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="card_no"
                                    name="card_no"
                                    placeholder="Search by Card No"
                                    value={this.state.searchFormData.card_no}
                                    onChange={this.onChangeHandler}
                                />
                            </div>
                        </div> */}

                        <div className="ts-d-table-search mb-2">
                                <label>Category: </label>
                                <Select
                            defaultValue={this.state.types.defaultValue}
                            placeholder={"Search by Category"}
                            onChange={(value) => this.handleSelectOnChange('type_id', value)}
                            style={{width: '100%'}}
                        >
                            <Option
                                value={0}
                                searchableData='---'
                                disabled={true}
                            >
                                --Select--
                            </Option>
                            {this.state.types.selectOptions}
                        </Select>
                                {/* <Select
                                    placeholder={"Search by type"}
                                    onChange={this.typeChangeHandler}
                                    style={{width: '100%'}}
                                >
                                    {this.state.types.selectOptions}
                                </Select> */}
                            </div>

                            <div className="ts-d-table-search mb-2">
                                <label>Sub Category: </label>
                                
                        <Select
                            defaultValue={this.state.subTypes.defaultValue}
                            placeholder={"Sub Category"}
                            value={this.state.subTypes.value}
                            onChange={(value) => this.handleSelectOnChange('sub_type_id', value)}
                            style={{width: '100%'}}
                        >
                            <Option
                                value={0}
                                searchableData='---'
                                disabled={true}
                            >
                                --Select--
                            </Option>
                            {this.state.subTypes.selectOptions}
                        </Select>
                              
                            </div>


                        <div className="ts-d-table-s-f-main">
                            <div className="ts-d-table-search mb-2">
                                <label>Ticket ID: </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="id"
                                    name="id"
                                    placeholder="Search by Ticket ID"
                                    value={this.state.searchFormData.id}
                                    onChange={this.onChangeHandler}
                                />
                            </div>
                        </div>
                        <div className="ts-d-table-s-f-main">
                            <div className="ts-d-table-search mb-2">
                                <label>Date & Time: </label>
                                <DatePicker
                                    placeholder  = "Created At" 
                                    style        = { {width: '100%'} }
                                    //defaultValue = {this.state.searchFormData.created_at != '' ? moment(this.state.searchFormData.created_at, 'YYYY-MM-DD') : null}
                                    onChange={this.dateOnChange}
                                />
                            </div>
                        </div>
                        <div className="ts-d-table-s-f-main">
                            <div className="ts-d-table-search mb-2">
                                <label>Title: </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="subject"
                                    name="subject"
                                    placeholder="Search by subject"
                                    value={this.state.searchFormData.subject}
                                    onChange={this.onChangeHandler}
                                />
                            </div>

                            <div className="form-group ts-d-input-fix">
                                <label>Contact: </label>
                                <Select
                                    showSearch
                                    placeholder={"Contact"}
                                    style={{width: '100%'}}
                                    defaultValue={this.state.contacts.defaultValue}
                                    defaultActiveFirstOption={false}
                                    filterOption={false}
                                    onSearch={this.handleContactSearch}
                                    onChange={(value) => this.handleSelectOnChange('contact_id', value)}
                                    notFoundContent={this.state.contacts.notFoundMessage}
                                >
                                    {this.state.contacts.selectOptions}
                                </Select>
                            </div>

                            <div className="ts-d-table-search mb-2">
                                <label>Group: </label>
                                <Select
                                    placeholder={"Search by group"}
                                    onChange={this.groupChangeHandler}
                                    style={{width: '100%'}}
                                >
                                    {this.state.groups.selectOptions}
                                </Select>
                            </div>

                            {/*agent*/}
                            <div className="form-group ts-d-input-fix">
                                <label>Agents: </label>
                                <Select
                                    showSearch
                                    placeholder={"Agent"}
                                    style={{width: '100%'}}
                                    defaultValue={this.state.agents.defaultValue}
                                    defaultActiveFirstOption={false}
                                    filterOption={false}
                                    onSearch={this.handleAgentSearch}
                                    onChange={(value) => this.handleSelectOnChange('agent_id', value)}
                                    notFoundContent={this.state.agents.notFoundMessage}
                                >
                                    {this.state.agents.selectOptions}
                                </Select>
                            </div>

                            <div className="ts-d-table-search mb-2">
                                <label>Status: </label>
                                <Select
                                    placeholder={"Search by status"}
                                    onChange={this.statusChangeHandler}
                                    style={{width: '100%'}}
                                >
                                    {this.state.statuses.selectOptions}
                                </Select>
                            </div>

                            <div className="ts-d-table-search mb-2">
                                <label>Priority: </label>
                                <Select
                                    placeholder={"Search by priority"}
                                    onChange={this.priorityChangeHandler}
                                    style={{width: '100%'}}
                                >
                                    {this.state.priorities.selectOptions}
                                </Select>
                            </div>

                           
                            <div className="ts-d-table-search mb-2">
                                <label>Source: </label>
                                <Select
                                    placeholder={"Search by source"}
                                    onChange={this.sourceChangeHandler}
                                    style={{width: '100%'}}
                                >
                                    {this.state.source.selectOptions}
                                </Select>
                            </div>
                            <div className="ts-d-table-search mb-2">
                                <label>From Date: </label>
                                <DatePicker
                                    placeholder  = "From Date" 
                                    style        = { {width: '100%'} }
                                    //defaultValue = {this.state.searchFormData.created_at != '' ? moment(this.state.searchFormData.created_at, 'YYYY-MM-DD') : null}
                                    onChange={this.fromDateOnChange}
                                />
                            </div>
                            <div className="ts-d-table-search mb-2">
                                <label>To Date: </label>
                                <DatePicker
                                    placeholder  = "To Date" 
                                    style        = { {width: '100%'} }
                                    //defaultValue = {this.state.searchFormData.created_at != '' ? moment(this.state.searchFormData.created_at, 'YYYY-MM-DD') : null}
                                    onChange={this.toDateOnChange}
                                />
                            </div>
                            <div className="ts-d-table-search mb-2 text-right">
                                <button type={'button'} className={'btn btn-info btn-sm'} onClick={() => {
                                    this.searchTicketByField()
                                }}>Search
                                </button>
                            </div>

                        </div>
                    </div>
                    {/*End Table Filter*/}
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

export default withRouter(TicketList);

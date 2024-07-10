import React from "react"
import BreadCrumbs from "../../components/common/BreadCrumbs";
import DataTable from 'react-data-table-component';
import { Modal, Spin, Select, message } from 'antd';
import Pagination from '../../components/Pagination/Pagination';
import {NavLink} from 'react-router-dom';
// import Form from './Form';
// import View from './View';
import {API_URL, ANTD_MESSAGE_MARGIN_TOP, DELETE_TITLE} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Auth from '../../services/Auth';
import Helper from '../../services/Helper';
import ActionButtons from '../../components/common/ActionButtons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
const { Option }    = Select;
const { confirm }   = Modal;

class NotificationTable extends React.Component {
    constructor() {
        super();
        this.state = {
            //breadcrumb
            locationPath: {
                base: 'Dashboard',
                basePath: '/',
                name: 'Notification List',
                path: 'notification',
            },
            dataTableSpinning   : true,
            modalTitle          : '',
            isModalVisible      : false,
            errors              : null,
            submitLoading       : false,
            isModelViewReady    : false,
            bulkActionView      : false,
            actionType          : '',
            pageNumber          : 1,
            serialCount         : 1,
            targetedPriority    : '',
            clearSelectedRows   : false,
            priorityFormData    : {
                name            : '',
                created_at      : '',
                updated_at	    : '',
            },
            columns: [
                {
                    name: 'NO.',
                    selector: row => row.id,
                    maxWidth: "60px"
                },
                {
                    name: 'Ticket',
                    selector: row => row.ticket,
                },
                {
                    name: 'Note',
                    selector: row => row.note,
                },
                {
                    name: 'Created Time',
                    selector: row => row.created_at,
                },
                {
                    name: 'Updated Time',
                    selector: row => row.updated_at,
                },
                {
                    name: 'Action',
                    selector: row => row.action,
                    maxWidth: "160px"
                }
            ],
            notificationData : []
        }

        this.selectedRow = [];

        this.handlePageClick        = this.handlePageClick.bind(this);
        this.handleCheckboxChange   = this.handleCheckboxChange.bind(this);
        this.bulkActionDelete       = this.bulkActionDelete.bind(this);
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData();
            this.setState({clearSelectedRows: true}); /* If page change then other page selected row will be deselect */
        });
        this.setState({clearSelectedRows: false});
    }

    async getNotifications(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/notifications?page=' + this.state.pageNumber, [], (new Token()).get(),this.params);
        } else{
            return await (new Api()).call('GET', API_URL + '/notifications?page=' + this.state.pageNumber + '&query='+ query, [], (new Token()).get());
        }

    }

    componentDidMount() {
        this.makeTableData();
    }

    makeTableData(page = null, query = ''){

        this.setState({clearSelectedRows: false});
        let data=[];
        let helper = new Helper();
        let isEditPermitted = (new Auth).isPermitted('notification-edit');
        let isDeletePermitted = (new Auth).isPermitted('notification-delete');

        this.getNotifications(page,query).then((response) => {
            //alert(isDeletePermitted);
            if (response.data.collections) {
                this.setState({serialCount: response.data.collections.from});
                response.data.collections.data.map((notification) => {

                    data.push({
                        id              : this.state.serialCount,
                        notificationId  : notification.id,
                        // ticket          : notification.ticket.subject,
                        ticket          : <NavLink to={"/tickets/reply/" + notification.ticket.id}>{notification.ticket.subject}</NavLink>,
                        note            : notification.note,
                        created_at      : notification.created_at,
                        updated_at      : notification.updated_at,
                        action          :<>
                                            <div>
                                                <ul className="list-inline m-0">
                                                    <ActionButtons
                                                        // viewActionProp  ={()=>this.viewAction(notification.id)}
                                                        // editActionProp  ={()=>this.editAction(notification.id)}
                                                        deleteActionProp={()=>this.deleteAction(notification.id)}
                                                        isEditPermitted ={isEditPermitted}
                                                        // isDeletePermitted={isDeletePermitted}
                                                    />
                                                </ul>
                                            </div>
                                        </>
                    });
                    this.setState({serialCount: (this.state.serialCount + 1)});
                    return 1;

                });
                this.setState({pageCount: response.data.collections.last_page});
            }

            this.setState({notificationData: data});
            this.setState({dataTableSpinning: false});
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
                let response = await (new Api()).call('DELETE', API_URL + '/notifications/' + id, [], (new Token()).get());
                if (response.data.status_code == 200) {
                    this.makeTableData(this.state.pageNumber);
                    message.success({
                        content: 'Deleted Successfully.',
                        style: {
                            marginTop: ANTD_MESSAGE_MARGIN_TOP,
                        }
                    });
                } else if (response.data.status_code == 424) {
                    this.setState({submitLoading: false});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
                }
            }
        });
    }

    handleCheckboxChange(selectedRow){
        this.selectedRow = [];

        if( selectedRow.selectedCount ){
            selectedRow.selectedRows.forEach((row, key)=>{
                this.selectedRow.push(row.notificationId);
            });
            this.setState({bulkActionView: true});
        }else{
            this.setState({bulkActionView: false});
        }
    }

    bulkActionDelete(){

        let selectedRow = this.selectedRow;
        confirm({
            title: DELETE_TITLE,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk : async ()=>{
                let response = await (new Api()).call('DELETE', API_URL + '/notifications', selectedRow, (new Token()).get());
                if (response.data.status_code == 200) {
                    this.makeTableData(this.state.pageNumber);
                    this.setState({clearSelectedRows: true});
                    this.setState({bulkActionView: false});
                    message.success({
                        content: 'Deleted Successfully.',
                        style: {
                            marginTop: ANTD_MESSAGE_MARGIN_TOP,
                        }
                    });
                } else if (response.data.status_code == 424) {
                    this.setState({submitLoading: false});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
                }
                this.setState({clearSelectedRows: false});
            }
        });

    }

    render() {

        return (
            <>
                <div className="col-lg-9 flex-one">
                    <div className="ts-d-notification-table-area table-responsive">
                        {/*Breadcrumb And Table Toolbars @mominriyadh 3/1/2022 */}
                        <div className="row align-items-center">
                            <div className="ts-d-notification-header">
                                <p className="pl-3">Notification List</p>
                            </div>

                            {
                                this.state.bulkActionView ?
                                    <div className="ml-auto col-md-6 mb-3">
                                        <div className="ts-d-notification-table-toolbar">
                                            {/* <button className="btn btn-outline-info btn-sm"><i className="bi bi-forward"> </i> Forward</button>
                                            <button className="btn btn-outline-info btn-sm"><i className="bi bi-x-square"> </i> Close</button> */}
                                            <button className="btn btn-outline-danger btn-sm" onClick={this.bulkActionDelete}><i className="bi bi-trash"> </i> Delete Selected</button>
                                        </div>
                                    </div>
                                : null
                            }
                      </div>

                <div className="container-fluid">

                    <div className={"ts-d-common-list-view"}>
                        <DataTable
                            columns={this.state.columns}
                            data={this.state.notificationData}
                            selectableRows
                            clearSelectedRows={this.state.clearSelectedRows}
                            onSelectedRowsChange={this.handleCheckboxChange}
                            noDataComponent={<Spin size="midium" tip="Getting Data..." spinning={this.state.dataTableSpinning}></Spin>}
                            striped={true}
                            highlightOnHover={true}
                        />
                    </div>

                </div>

                        {
                            this.state.pageCount > 1 ?
                                <Pagination pageCount={this.state.pageCount} handlePageClick={this.handlePageClick}/>
                            : null
                        }



                    </div>
                </div>
            </>
        )
    }
}

export default NotificationTable;

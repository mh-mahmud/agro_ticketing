import React from "react";
import Layout from "../../components/common/Layout";
import ICON_NOTIFICATION from "../../assets/images/icon-notification.svg";
import DataTable from 'react-data-table-component';
import {Modal, Spin, message} from 'antd';
import NotificationPagination from '../../components/Pagination/NotificationPagination';
import {NavLink} from 'react-router-dom';
import {API_URL, ANTD_MESSAGE_MARGIN_TOP, DELETE_TITLE, NO_DATA_MSG} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Auth from '../../services/Auth';
import Helper from '../../services/Helper';
import ActionButtons from '../../components/common/ActionButtons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
const {confirm} = Modal;

class Notification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            clearSelectedRows: false,
            dataTableSpinning: true,
            dataNotificationTblSpinning   : true,
            modalTitle: '',
            isModalVisible: false,
            errors: null,
            submitLoading: false,
            isModelViewReady: false,
            bulkActionView      : false,
            actionType: '',
            pageNumber: 1,
            pageNumberTable: 1,
            serialCount: 1,
            serialCountTable: 1,
            totalNotification : null,
            columnsSlot: [

                {
                    // name: 'Group',
                    selector: row => row.name,
                }

            ],
            groupList: [],
            columns: [
                {
                    name: 'NO.',
                    selector: row => row.id,
                    maxWidth: "60px"
                },
                {
                    name: 'Note',
                    selector: row => row.note,
                },
                {
                    name: 'Ticket',
                    selector: row => row.ticket,
                },
                {
                    name: 'Created Time',
                    selector: row => row.created_at,
                },
                {
                    name: 'Action',
                    selector: row => row.action,
                    maxWidth: "160px"
                }
            ],
            notificationData : []

        }
        // this.createNew          = this.createNew.bind(this);
        // this.updatePriorities   = this.updatePriorities.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);

        this.selectedRow = [];

        this.handleNotificationPageClick        = this.handleNotificationPageClick.bind(this);
        this.handleCheckboxChange   = this.handleCheckboxChange.bind(this);
        this.bulkActionDelete       = this.bulkActionDelete.bind(this);
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData();
        });
    }

    handleNotificationPageClick(item) {
        this.setState({pageNumberTable: (item.selected + 1)}, () => {
            this.makeNotificationTableData();
            this.setState({clearSelectedRows: true}); /* If page change then other page selected row will be deselect */
        });
        this.setState({clearSelectedRows: false});
    }

    async getNotifications(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/notifications?page=' + this.state.pageNumberTable, [], (new Token()).get(),this.params);
        }else{
            return await (new Api()).call('GET', API_URL + '/notifications?page=' + this.state.pageNumberTable + '&query='+ query, [], (new Token()).get());
        }

    }

    async getGroups() {
        return await (new Api()).call('GET', API_URL + '/groups?page=*', [], (new Token()).get(), this.params);
    }

    componentDidMount() {
        let allNotifications = this.getNotifications(1,null);
        allNotifications.then((response)=> {
            this.setState({totalNotification : response.data.collections.total},()=>{
                this.makeTableData();
                this.makeNotificationTableData();
            })
        })
    }

    makeNotificationTableData(page = 1, query = ''){

        // console.log(page)

        this.setState({clearSelectedRows: false});
        let data=[];
        let helper = new Helper();
        // let isEditPermitted = (new Auth).isPermitted('notification-edit');
        let isDeletePermitted = (new Auth).isPermitted('notification-delete');

        this.getNotifications(page,query).then((response) => {
            //alert(isDeletePermitted);
            if (response.data.collections) {
                this.setState({serialCountTable: response.data.collections.from});
                response.data.collections.data.map((notification) => {

                    data.push({
                        id              : this.state.serialCountTable,
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
                                                        isEditPermitted ={false}
                                                        isDeletePermitted={isDeletePermitted}
                                                    />
                                                </ul>
                                            </div>
                                        </>
                    });
                    this.setState({serialCountTable: (this.state.serialCountTable + 1)});
                    return 1;

                });
                this.setState({pageCountList:response.data.collections.last_page});
            }

            this.setState({notificationData: data});
            this.setState({dataNotificationTblSpinning: false});
        });

    }

    customNotificationsTable(e,groupID){
        // console.log(groupID)
        // pageNumberTable
        this.setState({pageNumberTable : 1},()=>{
            this.makeNotificationTableData(1,groupID);
            this.setState({clearSelectedRows: true}); /* If page change then other page selected row will be deselect */
        })
        this.setState({clearSelectedRows: false});

    }

     getTotalGroupNotification(group){
         
        if (group != null){
            let sum = 0;
            group.tickets.map((ticket)=>{
                sum += ticket.notifications.length
            })

            return sum;
        }
    }

    makeTableData() {
        let data = [];

        data.push({
            id: this.state.serialCount === 1 ? 0 : '',
            name: <>
                <div onClick={(e)=> this.customNotificationsTable(e, null)} className="ts-d-s-notification">
                    <img src={ICON_NOTIFICATION} alt=""/>
                    <div className="ts-d-s-notification-text">
                        <h5 className="text-capitalize">All</h5>
                    </div>
                    {this.state.totalNotification != null ?
                        <span className="ts-d-s-notification-no">{this.state.totalNotification}</span> : ''}
                </div>
            </>

        });


        // let helper = new Helper();
        // let isEditPermitted = (new Auth).isPermitted('notice-edit');
        // let isDeletePermitted = (new Auth).isPermitted('notice-delete');

        this.getGroups().then((response) => {
            
            if (response.data.group_list) {
                this.setState({serialCount: response.data.group_list.from});
                response.data.group_list.map((group) => {

                    data.push({
                        id: this.state.serialCount,
                        total: this.state.totalNotification,
                        name: <>
                            <div onClick={(e)=> this.customNotificationsTable(e, group.id)} className="ts-d-s-notification">
                                <img src={ICON_NOTIFICATION} alt=""/>
                                <div className="ts-d-s-notification-text">
                                    <h5 className="text-capitalize">{group.name}</h5>
                                </div>
                                <span className="ts-d-s-notification-no">{this.getTotalGroupNotification(group)}</span>
                            </div>
                        </>
                    });

                    this.setState({serialCount: (this.state.serialCount + 1)});
                    return 1;

                });
                this.setState({pageCount: response.data.group_list.last_page});
            }

            this.setState({groupList: data});
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
                    this.makeNotificationTableData(this.state.pageNumberTable);
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
                    this.makeNotificationTableData(this.state.pageNumberTable);
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
            <Layout>
                <div className="ts-d-top-header mb-4">
                    <div className="ts-d-acc-name">
                        <span className="bi bi-list"/>
                        <span className="ts-d-acc-name-text text-uppercase">Notification</span>
                    </div>
                </div>


                {/*Notification Slot Area Start*/}
                <div className="ts-d-notification-slot-area">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                (new Auth).isPermitted('all-notification') ? 
                                    <div className="col-lg-3 ts-d-notification-slot-main flex-one">

                                        <div className="ts-d-notification-header">
                                            <p className="text-capitalize">Group List</p>
                                            <i className="bi bi-three-dots-vertical"/>
                                        </div>

                                        <div className="ts-d-s-notification-area">
                                            <DataTable
                                                columns={this.state.columnsSlot}
                                                data={this.state.groupList}
                                                noDataComponent={<Spin size="midium"
                                                                        tip="Getting Data..."
                                                                        spinning={this.state.dataTableSpinning}></Spin>}
                                                striped={true}
                                                highlightOnHover={true}
                                            />
                                        </div>
                                    </div>
                                : null
                            }

                            {/*Start Notification Table */}
                                <div className={(new Auth).isPermitted('all-notification') ? "col-lg-9 flex-one" : "col-lg-12 flex-one"}>
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
                                                            <button className="btn btn-outline-danger btn-sm" onClick={this.bulkActionDelete}><i className="bi bi-trash"> </i> Delete Selected</button>
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                        </div>

                                        <div className="container-fluid">

                                            <div className={"ts-d-common-list-view"}>
                                                <DataTable
                                                    columns             ={this.state.columns}
                                                    data                ={this.state.notificationData}
                                                    selectableRows      ={(new Auth).isPermitted('notification-delete')}
                                                    clearSelectedRows   ={this.state.clearSelectedRows}
                                                    onSelectedRowsChange={this.handleCheckboxChange}
                                                    noDataComponent     ={this.state.dataNotificationTblSpinning ? <Spin size="midium" tip="Getting Data..." spinning={this.state.dataNotificationTblSpinning}></Spin> : NO_DATA_MSG}
                                                    striped             ={true}
                                                    highlightOnHover    ={true}
                                                />
                                            </div>

                                        </div>
                                       
                                        {
                                            this.state.pageCountList > 1 ?
                                                <NotificationPagination pageCountList={this.state.pageCountList} handleNotificationPageClick={this.handleNotificationPageClick}/>
                                                : null
                                        }
                                        
                                    </div>
                                </div>

                            {/*End Notification Table */}
                        </div>
                    </div>

                </div>
                {/*End Notification Slot Area Start*/}
            </Layout>
        )
    }
}

export default Notification;

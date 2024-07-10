import React from "react";
import ICON_NOTIFICATION from "../../assets/images/icon-notification.svg";
import ICON_DELETE from "../../assets/images/delete.svg";
import AddActionButtons from '../../components/common/AddActionButton';
import BreadCrumbs from "../../components/common/BreadCrumbs";
import DataTable from 'react-data-table-component';
import {Modal, Button, AutoComplete, Input, Spin, Select, Alert, message} from 'antd';
import Pagination from '../../components/Pagination/Pagination';
// import Form from './Form';
// import View from './View';
import {API_URL, ANTD_MESSAGE_MARGIN_TOP, DELETE_TITLE} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Auth from '../../services/Auth';
import Helper from '../../services/Helper';
import ActionButtons from '../../components/common/ActionButtons';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {SearchOutlined} from '@ant-design/icons';

const {Option} = Select;
const {confirm} = Modal;

class NotificationSlot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            dataTableSpinning: true,
            modalTitle: '',
            isModalVisible: false,
            errors: null,
            submitLoading: false,
            isModelViewReady: false,
            actionType: '',
            pageNumber: 1,
            serialCount: 1,


            columns: [

                {
                    // name: 'Group',
                    selector: row => row.name,
                }

            ],
            notificationList: []
        }


        // this.createNew          = this.createNew.bind(this);
        // this.updatePriorities   = this.updatePriorities.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
    }


    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData()
        });
    }

    async getGroups(page = null, query = null) {
        if (query == null) {
            return await (new Api()).call('GET', API_URL + '/groups?page=' + this.state.pageNumber, [], (new Token()).get(), this.params);
        } else {
            return await (new Api()).call('GET', API_URL + '/groups?page=' + this.state.pageNumber + '&query=' + query, [], (new Token()).get());
        }

    }

    componentDidMount() {
        this.makeTableData();

    }

    makeTableData(page = null, query = '') {
        let data = [];
        let helper = new Helper();
        let isEditPermitted = (new Auth).isPermitted('notice-edit');
        let isDeletePermitted = (new Auth).isPermitted('notice-delete');

        this.getGroups(page, query).then((response) => {
            //alert(isDeletePermitted);
            if (response.data.group_list) {
                this.setState({serialCount: response.data.group_list.from});
                response.data.group_list.data.map((group) => {

                    data.push({
                        id: this.state.serialCount,
                        name: <>
                            <div className="ts-d-s-notification">
                                <img src={ICON_NOTIFICATION} alt=""/>
                                <div className="ts-d-s-notification-text">
                                    <h5 className="text-capitalize">{group.name}</h5>
                                </div>
                                <span className="ts-d-s-notification-no">99</span>
                            </div>
                        </>

                    });
                    this.setState({serialCount: (this.state.serialCount + 1)});
                    return 1;

                });
                this.setState({pageCount: response.data.group_list.last_page});
            }

            this.setState({notificationList: data});
            this.setState({dataTableSpinning: false});

        });

    }

    render() {
        // const {notificationList} = this.state;
        return (
            <>
                <div className="col-lg-3 ts-d-notification-slot-main flex-one">

                    <div className="ts-d-notification-header">
                        <p className="text-capitalize">Notification Slot</p>
                        <i className="bi bi-three-dots-vertical"/>
                    </div>

                    <div className="ts-d-s-notification-area">
                        <DataTable
                            columns={this.state.columns}
                            data={this.state.notificationList}
                            noDataComponent={<Spin size="midium" tip="Getting Data..."
                                                   spinning={this.state.dataTableSpinning}></Spin>}
                            striped={true}
                            highlightOnHover={true}
                        />

                        {/* {notificationList.map((item, i) => {
                            return (
                                <div className="ts-d-s-notification">
                                    <img src={item.type !== 'delete' ? ICON_NOTIFICATION : ICON_DELETE} alt=""/>
                                    <div className="ts-d-s-notification-text">
                                        <h5 className="text-capitalize">{item.title}</h5>
                                        <small className="text-capitalize">{item.desc}</small>
                                    </div>
                                    {item.type !== 'general' ? '' : item.notification_no ?
                                        <span className="ts-d-s-notification-no">{item.notification_no}</span> : ''}
                                </div>
                            )
                        })} */}
                        {
                            this.state.pageCount > 1 ?
                                <Pagination pageCount={this.state.pageCount} handlePageClick={this.handlePageClick}/>
                                : ''
                        }



                    </div>
                </div>
            </>
        )
    }
}

export default NotificationSlot;

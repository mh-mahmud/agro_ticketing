import React, {Component} from 'react';
import AddActionButtons from '../../components/common/AddActionButton';
import BreadCrumbs from "../../components/common/BreadCrumbs";
import DataTable from 'react-data-table-component';
import {Modal, Button, Spin, Select, Alert, message, DatePicker, Tooltip, notification} from 'antd';
import Pagination from '../../components/Pagination/Pagination';
import Form from './Form';
import View from './View';
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

export default class HolidaysListView extends Component {

    constructor() {
        super();
        this.state = {
            //breadcrumb
            locationPath: {
                base: 'Dashboard',
                basePath: '/dashboard',
                name: 'Holiday List',
                path: 'holiday',
            },
            dataTableSpinning: true,
            modalTitle: '',
            isModalVisible: false,
            errors: null,
            submitLoading: false,
            isModelViewReady: false,
            actionType: '',
            pageNumber: 1,
            serialCount: 1,
            targetedHoliday: '',
            holidayFormData: {
                name: '',
                date: ''
            },
            searchField: '',
            columns: [
                {
                    name: 'NO.',
                    selector: row => row.id,
                    maxWidth: "60px"
                },
                {
                    name: 'Name',
                    selector: row => row.name,
                },
                {
                    name: 'Date',
                    selector: row => row.date,
                },
                {
                    name: 'Action',
                    selector: row => row.action,
                    maxWidth: "160px"
                }
            ],
            holidaysData: []
        }

        this.createNew = this.createNew.bind(this);
        this.seachAction = this.seachAction.bind(this);
        this.searchFieldOnChange = this.searchFieldOnChange.bind(this);
        this.updateHoliday = this.updateHoliday.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.dateOnChange = this.dateOnChange.bind(this);
    }

    handleCancel = () => {
        this.resetModal();
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData()
        });
    }

    async getHolidays(page = null, query = null) {

        if (!query) {
            query = 'page=*';
        }
        return await (new Api()).call('GET', API_URL + '/holidays?' + query, [], (new Token()).get(), this.params);

    }

    viewAction(id) {
        this.setState({viewSpinning: true});
        this.setState({isModalVisible: true});
        this.setState({actionType: 'view'});
        this.setState({modalTitle: "Holiday Details"});

        let targetedHoliday = this.state.holidaysData.find(holiday => holiday.holidayId === id);

        this.setState({targetedHoliday}, () => {
            this.setState({isModelViewReady: true});
            this.setState({viewSpinning: false});
        });

    }

    editAction(id) {

        this.setState({viewSpinning: true});
        this.setState({isModalVisible: true});
        this.setState({actionType: 'edit'});
        this.setState({modalTitle: "Edit Holiday"});

        let targetedHoliday = this.state.holidaysData.find(holiday => holiday.holidayId === id);
        let holidayFormData = {};

        for (var key in this.state.holidayFormData) {

            holidayFormData[key] = targetedHoliday[key] == null ? '' : targetedHoliday[key];

        }

        this.setState({targetedHoliday});
        this.setState({holidayFormData: holidayFormData});

        this.setState({targetedHoliday}, () => {
            this.setState({isModelViewReady: true});
            this.setState({viewSpinning: false});
        });

    }

    addAction() {

        this.setState({isModalVisible: true});
        this.setState({modalTitle: "Add New Holiday"});
        this.setState({actionType: "create"});

        let holidayFormData = {};
        for (var key in this.state.holidayFormData) {
            holidayFormData[key] = '';
        }

        this.setState({holidayFormData}, () => {
            this.setState({viewSpinning: false});
            this.setState({isModelViewReady: true});
        });

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
                let response = await (new Api()).call('DELETE', API_URL + '/holidays/' + id, [], (new Token()).get());
                if (response.data.status == 200) {
                    this.makeTableData(this.state.pageNumber);
                    this.resetModal();
                    /**
                     * @Developed by @mominriyadh  on 5/30/2022
                     * @URL https://ant.design/components/notification/*
                     *
                     */
                    notification.success({
                        message: 'Successfully Deleted',
                        description: 'Data Successfully Deleted Now',
                        placement: 'bottomRight'
                    })
                } else if (response.data.status == 424) {
                    this.setState({submitLoading: false});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
                } else if (response.data.status_code === 620) {
                    this.setState({submitLoading: false});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))}, () => {
                        // console.log(this.state.errors)
                        this.makeTableData(this.state.pageNumber);
                        this.resetModal();
                        message.error({
                            content: this.state.errors,
                            style: {
                                marginTop: ANTD_MESSAGE_MARGIN_TOP,
                            }
                        });
                    });
                }
            }
        });

    }

    resetModal() {
        this.setState({isModalVisible: false});
        this.setState({submitLoading: false});
        this.setState({isModelViewReady: false});
        this.setState({viewSpinning: false});
        this.setState({errors: null});
    }

    onChangeHandler = (event, key) => {
        const {holidayFormData} = this.state;
        holidayFormData[event.target.name] = event.target.value;
        this.setState({holidayFormData});
    }

    dateOnChange(date, dateString) {
        const {holidayFormData} = this.state;
        holidayFormData.date = dateString;
        this.setState({holidayFormData});
    }

    handleSelectOnChange = (target, value) => {
        let {holidayFormData} = this.state;
        holidayFormData[target] = value;
        this.setState({holidayFormData});
    }

    async createNew() {

        this.setState({submitLoading: true});
        let response = await (new Api()).call('POST', API_URL + `/holidays`, this.state.holidayFormData, (new Token()).get());
        if (response.data.status == 201) {

            this.makeTableData(this.state.pageNumber);
            this.resetModal();
            /**
             * @Developed by @mominriyadh  on 1/30/2022
             * @URL https://ant.design/components/notification/*
             *
             */
            notification.success({
                message: 'Successfully Updated',
                description: 'New holiday has been added',
                placement: 'bottomRight'
            })

        } else if (response.data.status == 400) {

            this.setState({submitLoading: false});
            this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});

        }

    }

    async updateHoliday() {

        this.setState({submitLoading: true});
        let response = await (new Api()).call('PUT', API_URL + `/holidays/` + this.state.targetedHoliday.holidayId, this.state.holidayFormData, (new Token()).get());

        if (response.data.status == 200) {

            this.makeTableData(this.state.pageNumber);
            this.resetModal();
            /**
             * @Developed by @mominriyadh  on 5/30/2022
             * @URL https://ant.design/components/notification/*
             *
             */
            notification.success({
                message: 'Successfully Updated',
                description: 'Data Successfully Updated Now',
                placement: 'bottomRight'
            })

        } else if (response.data.status == 400) {

            this.setState({submitLoading: false});
            this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});

        }
    }

    handleSearch = value => {
        this.makeTableData('', value);
    }

    onHandleSelect = value => {
        this.makeTableData('', value);
    }

    searchFieldOnChange(value, stringVal) {
        this.setState({searchField: stringVal});
    }

    seachAction() {
        this.setState({dataTableSpinning: true}, () => {
            this.makeTableData(null, 'year=' + this.state.searchField)
        });
    }

    componentDidMount() {
        this.makeTableData();
    }

    makeTableData(page = null, query = '') {
        let data = [];
        let helper = new Helper();
        let isEditPermitted = (new Auth).isPermitted('holiday-edit');
        let isDeletePermitted = (new Auth).isPermitted('holiday-delete');

        this.getHolidays(page, query).then((response) => {
            //alert(isDeletePermitted);
            if (response.data.collections) {
                this.setState({serialCount: 1});
                response.data.collections.map((holiday) => {

                    data.push({
                        id: this.state.serialCount,
                        holidayId: holiday.id,
                        name: holiday.name,
                        date: holiday.date,
                        action: <>
                            <div>
                                <ul className="list-inline m-0">
                                    <ActionButtons
                                        // viewActionProp  ={()=>this.viewAction(holiday.id)}
                                        editActionProp={() => this.editAction(holiday.id)}
                                        deleteActionProp={() => this.deleteAction(holiday.id)}
                                        isEditPermitted={isEditPermitted}
                                        isDeletePermitted={isDeletePermitted}
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

            this.setState({holidaysData: data});
            this.setState({dataTableSpinning: false});

        });

    }

    getModalView() {

        if (this.state.actionType != "view") {
            return <Form

                onChangeHandler={this.onChangeHandler}
                dateOnChange={this.dateOnChange}
                handleSelectOnChange={this.handleSelectOnChange}
                holidayFormData={this.state.holidayFormData}

            />
        } else {
            /* return <View
                targetedHoliday = {this.state.targetedHoliday}
                sources = {this.state.holidaysData}
            /> */
        }
    }

    render() {
        let {locationPath} = this.state
        return (
            <>

                <Modal
                    width="50%"
                    centered
                    zIndex="1050"
                    title={this.state.modalTitle}
                    visible={this.state.isModalVisible}
                    // confirmLoading={this.state.confirmLoading}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button
                            key="back"
                            onClick={this.handleCancel}
                        >
                            Close
                        </Button>,
                        <Button
                            className={this.state.actionType == "view" ? "d-none" : ""}
                            loading={this.state.submitLoading}
                            key="Submit"
                            type="primary"
                            onClick={this.state.actionType == "edit" ? () => this.updateHoliday() : () => this.createNew()}
                        >
                            Submit
                        </Button>
                    ]}>
                    {
                        this.state.errors ?
                            <>
                                <Alert
                                    message="Something Wrong !"
                                    description={this.state.errors}
                                    type="error"
                                    closable
                                />
                            </>
                            : ''
                    }
                    <div className="spinner-centered mt-2">
                        <div className="text-center">
                            <Spin size="large" spinning={this.state.viewSpinning}></Spin>
                        </div>
                        {this.state.isModelViewReady ? this.getModalView() : ''}
                    </div>
                </Modal>

                <div className={"ts-d-top-header mb-4"}>
                    <div className={"ts-d-acc-name"}>
                        <span className={"bi bi-list"}/>
                        <span className={"ts-d-acc-name-text text-uppercase"}> Holiday List</span>
                    </div>

                    <div className={"form-group m-0"}>
                        {
                            (new Auth).isPermitted('holiday-create') ?
                                <AddActionButtons addActionProp={() => this.addAction()}/>
                                : null
                        }
                    </div>
                </div>
                <BreadCrumbs locationPath={locationPath}/>

                {/*Search Components*/}
                <div className="ts-d-holiday-search-area mb-4">

                    <div className="container-fluid p-0">
                        <div className="row">
                            <div className="col-md-10 mx-auto py-md-2 py-1">
                                <div className="ts-d-holiday-search-main mx-0">
                                    <DatePicker
                                        onChange={this.searchFieldOnChange}
                                        picker="year"
                                    />
                                    <Tooltip title="search">
                                        <Button
                                            type="primary"
                                            shape="circle"
                                            icon={<SearchOutlined/>}
                                            onClick={this.seachAction}
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-fluid">

                    <div className={"ts-d-common-list-view"}>
                        <DataTable
                            columns={this.state.columns}
                            data={this.state.holidaysData}
                            noDataComponent={<Spin size="midium" tip="Getting Data..."
                                                   spinning={this.state.dataTableSpinning}></Spin>}
                            striped={true}
                            highlightOnHover={true}
                        />
                    </div>

                </div>

                {/* <Pagination pageCount={this.state.pageCount} handlePageClick={this.handlePageClick}/> */}
            </>
        )
    }
}

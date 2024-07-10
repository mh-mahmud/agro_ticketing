import React, {Component} from 'react';
import Layout from '../../components/common/Layout';
import DataTable from 'react-data-table-component';
import Pagination from '../../components/Pagination/Pagination';
import {API_URL, ANTD_MESSAGE_MARGIN_TOP, DELETE_TITLE} from "../../Config";
import Token from '../../services/Token';
import Api from '../../services/Api';
import ActionButtons from '../../components/common/ActionButtons';
import {Modal, AutoComplete, Input, Spin, Button, message, Alert, Switch, notification} from 'antd';

import Checkbox from '../../components/common/CheckBox';
import Helper from '../../services/Helper';
import AddActionButtons from '../../components/common/AddActionButton';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Auth from '../../services/Auth';
import PermissionList from './PermissionList';
import BreadCrumbs from "../../components/common/BreadCrumbs";
import { SearchOutlined } from '@ant-design/icons';

const { confirm }   = Modal;

export default class RoleListView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            //breadcrumb
            locationPath                        : {
                base                            : 'Dashboard',
                basePath                        : '/',
                name                            : 'Roles List',
                path                            : 'roles',
            },
            pageCount           : 0,
            serialCount         : 1,
            viewModalTitle      : '',
            isViewTableReady    : false,
            isViewModalVisible  : false,
            viewSpinning        : false,
            dataTableSpinning   : true,
            viewUserRole        : null,
            roleName            : '',
            roleStatus          : 0,
            roleStatusDisable   : false,
            givenPermission     : null,
            actionId            : '',
            actionType          : '',
            submitLoading       : false,
            pageNumber          : 1,
            errors              : null,
            columns             : [
                {
                    name: 'NO.',
                    selector: row => row.serial,
                    maxWidth: "60px"
                },
                {
                    name: 'Name',
                    selector: row => row.name,
                },
                {
                    name                        : 'Created Time',
                    selector                    : row => row.created_at,
                },
                {
                    name                        : 'Updated Time',
                    selector                    : row => row.updated_at,
                },
                {
                    name: 'Action',
                    selector: row => row.action,
                    maxWidth: "160px"
                }
            ],
            roles               : [],
            roleData            : [],
            permissionGroupData : null
        };
        this.handlePageClick            = this.handlePageClick.bind(this);
        this.handleAllChecked           = this.handleAllChecked.bind(this);
        this.handlePermissionOnChange   = this.handlePermissionOnChange.bind(this);
    }

    // async getRoles() {
    //     let permissionGroup = await (new Api()).call('GET', API_URL + '/permissionGroups', [], (new Token()).get());
    //     this.setState({permissionGroupData: permissionGroup.data.permission_group_list});
    //     let roles = await (new Api()).call('GET', API_URL + '/roles?page=' + this.state.pageNumber, [], (new Token()).get());
    //     return roles;
    // }

    async getRoles(page = null, query = null) {
        let permissionGroup = await (new Api()).call('GET', API_URL + '/permissionGroups', [], (new Token()).get());
        this.setState({permissionGroupData: permissionGroup.data.permission_group_list});
        if (query == null){
            let roles = await (new Api()).call('GET', API_URL + '/roles?page=' + this.state.pageNumber, [], (new Token()).get(),this.params);
            return roles;
        } else{
            let roles = await (new Api()).call('GET', API_URL + '/roles?page=' + this.state.pageNumber + '&query='+ query, [], (new Token()).get());
            return roles;
        }

    }


    componentDidMount() {
        this.makeTableData();
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)});
        this.makeTableData();
    }


    deleteAction(id) {
        confirm({
            title: DELETE_TITLE,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk : async ()=>{
                let response = await (new Api()).call('DELETE', API_URL + '/roles/' + id, [], (new Token()).get());
                if (response.data.status == 200) {
                    this.makeTableData(this.state.pageNumber);
                    this.resetModal();
                    // message.success({
                    //     content: 'Deleted Successfully.',
                    //     style: {
                    //         marginTop: ANTD_MESSAGE_MARGIN_TOP,
                    //     }
                    // });

                    /**
                     * @Developed by @mominriyadh  on 1/30/2022
                     * @URL https://ant.design/components/notification/*
                     *
                     */
                    notification.success({
                        message: 'Deleted',
                        description: 'Data Successfully Deleted Now',
                        placement:'bottomRight'
                    })

                } else if (response.data.status == 400) {
                    this.setState({submitLoading: false});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
                } else if (response.data.status_code === 620) {
                    this.setState({submitLoading: false});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))},()=>{
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

    handleOk = () => {
        this.resetModal();
    }

    handleCancel = () => {
        this.resetModal();
    }

    resetModal() {
        this.setState({isViewModalVisible   : false});
        this.setState({viewSpinning         : false});
        this.setState({isViewTableReady     : false});
        this.setState({submitLoading        : false});
        this.setState({actionId             : null});
    }

    generatePermissionGiven() {
        let targetdRole = this.state.roleData.find(role => role.id === this.state.actionId);
        this.setState({roleStatus: targetdRole.status});
        let permissionGroupData = this.state.permissionGroupData;
        let isAllPemission = true;
        permissionGroupData.map((permissionGroup) => {
            permissionGroup.permissions.map((originalPermission) => {
                if (targetdRole.permissions.find((givenPermission) => (givenPermission.id == originalPermission.id) && (givenPermission.permission_group_id == originalPermission.permission_group_id))) {
                    originalPermission.isPermissionGiven = true;
                } else {
                    originalPermission.isPermissionGiven = false;
                    isAllPemission = false;
                }
                return 1;
            });
            permissionGroup.isAllPemission = isAllPemission;
            isAllPemission = true;
            return 1;
        });
        this.setState({permissionGroupData: permissionGroupData});
    }

    viewAction(id) {
        this.state.actionId = id;
        this.setState({actionType: 'view'});
        this.setState({viewSpinning: true});
        this.setState({viewModalTitle: "Role Details"});
        this.setState({isViewModalVisible: true});
        this.setState({roleStatusDisable: true});
        let roles = this.state.roles.find(role => role.id === id);
        this.generatePermissionGiven();
        this.setState({viewUserRole: roles});
        this.setState({roleName: roles.name});
        this.setState({viewSpinning: false});
        this.setState({isViewTableReady: true});
    }

    editAction(id) {
        this.state.actionId = id;
        this.setState({actionType: 'edit'});
        this.setState({viewSpinning: true});
        this.setState({viewModalTitle: "Edit Role Details"});
        this.setState({isViewModalVisible: true});
        this.setState({roleStatusDisable: false});
        let roles = this.state.roles.find(role => role.id === id);
        this.generatePermissionGiven();
        this.setState({viewUserRole: roles});
        this.setState({roleName: roles.name});
        this.setState({viewSpinning: false});
        this.setState({isViewTableReady: true});
    }

    resetAllCheckBox() {
        let permissionGroupData = JSON.parse(JSON.stringify(this.state.permissionGroupData));
        permissionGroupData.map((permissionGroup) => {
            permissionGroup.permissions.map((permission) => {
                permission.isPermissionGiven = false;
            });
            permissionGroup.isAllPemission = false;
        });
        this.setState({permissionGroupData: permissionGroupData});
    }

    handleAllChecked(event, targetedPermissionGroup) {
        let permissionGroupData = JSON.parse(JSON.stringify(this.state.permissionGroupData));
        permissionGroupData.map((permissionGroup) => {
            if (permissionGroup.id == targetedPermissionGroup.id) {
                permissionGroup.permissions.map((permission) => {
                    permission.isPermissionGiven = event.target.checked;
                });
                permissionGroup.isAllPemission = event.target.checked;
            }
        });
        this.setState({permissionGroupData: permissionGroupData});
    }

    handlePermissionOnChange(id, group_id) {
        let permissionGroupData = JSON.parse(JSON.stringify(this.state.permissionGroupData));
        permissionGroupData.forEach(permissionGroup => {
            for (var i = 0; i < permissionGroup.permissions.length; i++) {
                if (permissionGroup.permissions[i].id == id && permissionGroup.permissions[i].permission_group_id == group_id) {
                    permissionGroup.permissions[i].isPermissionGiven = !permissionGroup.permissions[i].isPermissionGiven;
                }
            }
        });
        this.setState({permissionGroupData: permissionGroupData});
    }

    makeApiData() {
        let apiData = {
            name: this.state.roleName,
            permission: []
        };
        this.state.permissionGroupData.map((permission_group) => {
            permission_group.permissions.map((permission) => {
                if (permission.isPermissionGiven) {
                    apiData.permission.push(permission.id);
                }
            });
        });
        return apiData;
    }

    async updateRolePermission() {

        this.setState({submitLoading: true});
        this.setState({errors: null});
        let apiData = {...this.makeApiData(), status: this.state.roleStatus};
        let response = await (new Api()).call('PUT', API_URL + `/roles/${this.state.actionId}`, apiData, (new Token()).get());

        if (response.data.status == 200) {
            this.makeTableData(this.state.pageNumber);
            this.resetModal();
            // message.success({
            //     content: 'Successfully Updated.',
            //     style: {
            //         marginTop: ANTD_MESSAGE_MARGIN_TOP,
            //     }
            // });

            /**
             * @Developed by @mominriyadh  on 1/30/2022
             * @URL https://ant.design/components/notification/*
             *
             */
            notification.success({
                message: 'Successfully Updated',
                description: 'Data Successfully Updated Now',
                placement:'bottomRight'
            })

        } else if (response.data.status == 400) {
            this.setState({submitLoading: false});
            this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
        }

    }

    addNew() {
        this.state.actionType = 'create';
        this.setState({viewSpinning: true});
        this.setState({viewModalTitle: "Add New Role"});
        this.setState({isViewModalVisible: true});
        this.setState({roleName: ''});
        this.resetAllCheckBox();
        this.setState({viewSpinning: false});
        this.setState({isViewTableReady: true});
    }

    async createRolePermission() {

        this.setState({submitLoading: true});
        this.setState({errors: null});
        let apiData = {...this.makeApiData(), status: this.state.roleStatus};
        let response = await (new Api()).call('POST', API_URL + `/roles`, apiData, (new Token()).get());

        if (response.data.status == 200) {
            this.makeTableData(this.state.pageNumber);
            this.resetModal();
            // message.success({
            //     content: 'Successfully Created.',
            //     style: {
            //         marginTop: ANTD_MESSAGE_MARGIN_TOP,
            //     }
            // });

            /**
             * @Developed by @mominriyadh  on 1/30/2022
             * @URL https://ant.design/components/notification/*
             *
             */
            notification.success({
                message: 'Successfully Created.',
                description: 'Data Successfully Created Now',
                placement:'bottomRight'
            })

        } else if (response.data.status == 400) {
            this.setState({submitLoading: false});
            this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
        }

    }
    handleSearch = value =>
    {
        this.makeTableData('',value);
    }

    onHandleSelect = value => {
        this.makeTableData('',value);
    }

    makeTableData(page = null, query = '') {

        let isEditPermitted = (new Auth).isPermitted('role-edit');
        let isDeletePermitted = (new Auth).isPermitted('role-delete');
        let tempData = [];
        this.getRoles(page,query).then((response) => {

            if (response.data.role_list) {
                this.setState({serialCount: response.data.role_list.from});
                response.data.role_list.data.map((role) => {
                    tempData.push({
                        serial: this.state.serialCount,
                        id: role.id,
                        name: role.name,
                        created_at: role.created_at,
                        updated_at: role.updated_at,
                        action: <>
                                    <div>
                                        <ul className="list-inline m-0">
                                            <ActionButtons
                                                viewActionProp={() => this.viewAction(role.id)}
                                                editActionProp={() => this.editAction(role.id)}
                                                deleteActionProp={() => this.deleteAction(role.id)}
                                                isEditPermitted ={isEditPermitted}
                                                isDeletePermitted={isDeletePermitted}
                                            />
                                        </ul>
                                    </div>
                                </>
                    });
                    this.setState({serialCount: (this.state.serialCount + 1)});
                    return 1;
                });
                this.setState({pageCount: response.data.role_list.last_page});
            }

            this.setState({roles: tempData});
            this.setState({roleData: response.data.role_list.data});
            this.setState({dataTableSpinning: false});
        });

    }

    render() {
        let {locationPath} = this.state
        return (
            <Layout>
                <Modal
                    width="75%"
                    centered
                    zIndex="1050"
                    title={this.state.viewModalTitle}
                    visible={this.state.isViewModalVisible}
                    onCancel={this.handleCancel}
                    bodyStyle={{paddingLeft: 40, paddingRight: 40}}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                            Close
                        </Button>,
                        <Button
                            className={this.state.actionType === "view" ? "d-none" : ""}
                            loading={this.state.submitLoading}
                            key="Update"
                            type="primary"
                            onClick={this.state.actionType === "edit" ? () => this.updateRolePermission() : () => this.createRolePermission()}
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
                        <Spin size="large" spinning={this.state.viewSpinning}></Spin>
                        {this.state.isViewTableReady ?
                            <>

                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text" id="basic-addon3">Role Name</span>
                                    </div>
                                    <input
                                        type="text"
                                        readOnly={this.state.actionType == 'view' ? true : false}
                                        className="form-control"
                                        placeholder="Role Name"
                                        value={this.state.roleName}
                                        onChange={(e) => this.setState({roleName: e.target.value})}
                                    />
                                </div>

                                <div className="mb-3">
                                    <div className="">
                                        {/* <h6>Status</h6>
                                        <Switch
                                            disabled={this.state.roleStatusDisable}
                                            checkedChildren="Active"
                                            unCheckedChildren="Inactive"
                                            onChange={(checked, e) => {
                                                this.setState({roleStatus: (checked ? 1 : 0)})
                                            }}
                                            defaultChecked={this.state.roleStatus == 1 ? true : false}
                                        /> */}
                                    </div>
                                </div>

                                <PermissionList
                                    permissionGroupData     ={this.state.permissionGroupData}
                                    actionType              ={this.state.actionType}
                                    handleAllChecked        ={this.handleAllChecked}
                                    handlePermissionOnChange={this.handlePermissionOnChange}
                                />

                            </>
                            : ''}
                    </div>
                </Modal>

                <div className="ts-d-top-header mb-4">
                    <div className="ts-d-acc-name">
                        <span className="bi bi-list"/>
                        <span className="ts-d-acc-name-text text-uppercase"> Role List</span>
                    </div>

                    <div className="form-group m-0">
                        <ul className="list-inline m-0">
                            <li className="list-inline-item">
                                {
                                    (new Auth).isPermitted('role-create') ?
                                        <AddActionButtons addActionProp={() => this.addNew()} />
                                        : null
                                }
                            </li>
                        </ul>
                    </div>
                </div>

                <BreadCrumbs locationPath={locationPath}/>
                   {/*Search Components*/}
                   <div className="container-fluid p-0 mb-4">
                    <div className="ts-d-search-area mx-0">
                        <AutoComplete
                            style={{ width: '100%',}}
                            option={this.state.roleData.map(({name})=>name)}
                            placeholder="Search your item...."
                            onSelect={this.onHandleSelect}
                            onSearch={this.handleSearch}
                            filterOption={(inputValue, option) =>
                                option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                            }
                        >
                            <Input suffix={<SearchOutlined type="search"/>} />
                        </AutoComplete>
                    </div>
                </div>

                <div className="container-fluid">
                    <div className="ts-d-common-list-view">
                        <DataTable
                            columns={this.state.columns}
                            data={this.state.roles}
                            noDataComponent={<Spin size="medium" tip="Getting Data..." spinning={this.state.dataTableSpinning}></Spin>}
                            striped={true}
                            highlightOnHover={true}
                        />
                    </div>
                </div>

                <Pagination pageCount={this.state.pageCount} handlePageClick={this.handlePageClick}/>

            </Layout>
        )
    }
}

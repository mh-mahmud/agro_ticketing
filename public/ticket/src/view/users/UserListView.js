import React from 'react';
import Api from '../../services/Api';
import DataTable from 'react-data-table-component';
import {API_URL, ANTD_MESSAGE_MARGIN_TOP, DELETE_TITLE} from "../../Config";
import Token from '../../services/Token';
import Pagination from '../../components/Pagination/Pagination';
import ActionButtons from '../../components/common/ActionButtons';
import {Modal, Spin, Select, Button, Alert, message, Switch, Tooltip, AutoComplete, Input, notification} from 'antd';
import Helper from '../../services/Helper';
import Joi from 'joi';
import AddActionButtons from '../../components/common/AddActionButton';
import Auth from '../../services/Auth';
import PermissionList from './PermissionList';
import {ExclamationCircleOutlined, SearchOutlined} from '@ant-design/icons';
import BreadCrumbs from "../../components/common/BreadCrumbs";

const {Option} = Select;
const {confirm} = Modal;
const {Search} = Input;

export default class UserListView extends React.Component {

    constructor(props) {
        super(props);

        this.Helper = new Helper();

        this.state = {
            //breadcrumb
            user_info: JSON.parse(localStorage.getItem("user_info")),
            locationPath: {
                base: 'Dashboard',
                basePath: '/',
                name: 'Users List',
                path: 'users',
            },

            pageCount: 0,
            pageNumber: 1,
            serialCount: 1,
            isViewModalVisible: false,
            viewSpinning: false,
            viewModalTitle: '',
            confirmViewLoading: false,
            isViewTableReady: false,
            submitLoading: false,
            viewUserInfo: '',
            actionType: '',
            roles: null,
            groups: null,
            roleChildren: null,
            roleSelected: [],
            targetedUser: null,
            errors: null,
            permissionGroupData: null,
            userSpecialPermissions: null,
            dataTableSpinning: true,
            userFormData: {
                first_name: '',
                middle_name: '',
                last_name: '',
                account_no: '',
                card_no: '',
                cif_id: '',
                address: '',
                email: '',
                mobile: '',
                roles: '',
                username: '',
                photo: '',
                password: '',
                confirm_password: '',
                status: 0
            },
            validationError: {
                first_name: '',
                middle_name: '',
                last_name: '',
                account_no: '',
                card_no: '',
                cif_id: '',
                address: '',
                email: '',
                mobile: '',
                roles: '',
                username: '',
                photo: '',
                password: '',
                confirm_password: '',
                status: 0
            },
            search_query: '',
            columns: [
                {
                    name: 'NO.',
                    selector: row => row.id,
                    maxWidth: "60px"
                },
                {
                    name: 'Photo',
                    selector: row => row.url ? <img className="img-60 p-1" src={row.url}
                                                    alt={this.Helper.getFullName(row)}/> : '---',
                },
                {
                    name: 'First Name',
                    selector: row => (row.isSpecialPermission ?
                        <Tooltip title="This user has some special permission"><span>{row.first_name} <i
                            class="bi bi-flower3" style={{color: "red"}}></i></span></Tooltip> : row.first_name),
                },
                {
                    name: 'Last Name',
                    selector: row => row.last_name,
                },
                {
                    name: 'Email',
                    selector: row => row.email ?? '---',
                },
                {
                    name: 'Mobile',
                    selector: row => row.mobile,
                },
                {
                    name: 'Roles',
                    selector: row => row.roles ?? 'N/A',
                },
                // row.currentLoggedInUser.slug == 'admin-user'? :null,
                {
                    name: 'Action',
                    selector: row => row.action,
                    maxWidth: "160px"
                },
            ],
            usersData: []
        };
        this.handlePageClick = this.handlePageClick.bind(this);
        this.handleRolesSelect = this.handleRolesSelect.bind(this);
        this.photoOnChange = this.photoOnChange.bind(this);
        this.statusOnChange = this.statusOnChange.bind(this);
        this.deleteAction = this.deleteAction.bind(this);
        this.handleAllChecked = this.handleAllChecked.bind(this);
        this.handlePermissionOnChange = this.handlePermissionOnChange.bind(this);

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

    generatePermissionGiven(user) {
        let roleWisePermissions = [];

        user.roleIds.forEach((roleId, key) => {
            let role = this.state.roles.data.role_list.find((role) => role.id === roleId);
            roleWisePermissions = roleWisePermissions.concat(role.permissions);
        });

        let permissionGroupData = this.state.permissionGroupData;
        let isAllPemission = true;
        permissionGroupData.map((permissionGroup) => {
            permissionGroup.isAllRoleBasePermission = false;
            permissionGroup.permissions.map((originalPermission) => {
                if (roleWisePermissions.find((givenPermission) => (givenPermission.id == originalPermission.id) && (givenPermission.permission_group_id == originalPermission.permission_group_id))) {
                    originalPermission.isPermissionGiven = true;
                    originalPermission.isRoleBasePermission = true;
                    permissionGroup.isAllRoleBasePermission = isAllPemission;// If one permission is true then it will be true
                } else {
                    originalPermission.isPermissionGiven = false;
                    originalPermission.isRoleBasePermission = false;
                    isAllPemission = false;
                }
                return 1;
            });
            permissionGroup.isAllPemission = isAllPemission;
            isAllPemission = true;
            return 1;
        });
        isAllPemission = true;
        permissionGroupData.map((permissionGroup) => {
            permissionGroup.permissions.forEach((permission) => {
                if (this.state.userSpecialPermissions.find((userSpecialPermission) => userSpecialPermission.permission_id === permission.id)) {
                    permission.isPermissionGiven = true;
                } else {
                    isAllPemission = false;
                }
            });
            if (!permissionGroup.isAllRoleBasePermission) {
                permissionGroup.isAllPemission = isAllPemission;
            }
            isAllPemission = true;
            // permissionGroup.isAllPemission = isAllPemission;
            return 1;
        });

        this.setState({permissionGroupData: permissionGroupData});
    }

    async getUsers(page = null, query = null) {
        
        if( this.props.userType !== undefined ){
            query = this.props.userType;
        }

        if (query == null) {
            return await (new Api()).call('GET', API_URL + '/users?page=' + page, [], (new Token()).get());
        } else {
            return await (new Api()).call('GET', API_URL + '/users?page=' + page + '&query=' + query, [], (new Token()).get());
        }

    }

    async getPermissions() {
        let permissionGroup = await (new Api()).call('GET', API_URL + '/permissionGroups', [], (new Token()).get());
        this.setState({permissionGroupData: permissionGroup.data.permission_group_list});
    }

    async getUserSpecialPermissions(user) {
        let userSpecialPermissions = await (new Api()).call('GET', API_URL + '/user/specialPermissions/' + user.userId, [], (new Token()).get());
        this.setState({userSpecialPermissions: userSpecialPermissions.data.userPermissions}, () => {
            this.generatePermissionGiven(user);
        });
    }

    async getAllRoles() {
        let roles = await (new Api()).call('GET', API_URL + '/getList/roles?page=*', [], (new Token()).get());
        this.setState({roles: roles});
    }

    async getAllGroups() {
        let groups = await (new Api()).call('GET', API_URL + '/groups?page=*', [], (new Token()).get());
        this.setState({groups: groups});
    }

    /* Modal Methods */
    handleOk = () => {
        this.resetModal();
    }

    handleCancel = () => {
        this.resetModal();
    }

    resetModal() {
        this.setState({isViewModalVisible: false});
        this.setState({viewSpinning: false});
        this.setState({isViewTableReady: false});
        this.setState({submitLoading: false});
        this.setState({targetedUser: null});
        this.setState({errors: null});
    }

    /* End Modal Methods */

    componentDidMount() {
        this.makeTableData();
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData()
        });
    }

    handleRolesSelect(value) {
        let {userFormData} = this.state;
        if (value === undefined || value.length == 0) {
            value = '';
        }
        userFormData.roles = value;
        this.setState({userFormData});
    }

    async generateRolesOption() {

        const roleChildren = [];
        this.state.roles.data.role_list.forEach((role, index) => {
            roleChildren.push(<Option
                key={role.id}
                value={role.id}
                label={role.name}
            >
                <div className="demo-option-label-item">{role.name}</div>
            </Option>);
        })
        this.setState({roleChildren});

    }

    editAction(id) {
        this.setState({viewSpinning: true});
        this.setState({isViewModalVisible: true});
        this.setState({actionType: 'edit'});
        this.setState({viewModalTitle: "Edit Details"});

        this.generateRolesOption();
        let targetedUser = this.state.usersData.find(user => user.userId === id);
        this.getUserSpecialPermissions(targetedUser);
        let userFormData = {};

        // Copy from targetedUser
        for (var key in this.state.userFormData) {
            userFormData[key] = (key == 'roles') ? targetedUser['roleIds'] : (targetedUser[key] == null ? '' : targetedUser[key]);
        }
        
        this.setState({userFormData: userFormData});
        this.setState({targetedUser: targetedUser});
        this.setState({roleSelected: targetedUser.roleIds}, () => {
            this.setState({isViewTableReady: true});
        });
        this.setState({viewSpinning: false});
    }

    validateUserData(additionalRule = null) {
        let rules = {
            first_name: Joi.string().min(3).label('First Name').required(),
            middle_name: Joi.string().allow('', null).min(3).label('Middle Name'),
            address: Joi.string().allow('', null).label('Address'),
            last_name: Joi.string().allow('', null).label('Last Name'),
            email: Joi.string().label('Email').email({minDomainSegments: 2, tlds: {}}),
            mobile: Joi.string().min(3).label('Mobile').required(),
            roles: Joi.array().items(Joi.number()).label('Roles').required(),
            username: Joi.string().label('Username').required(),
            status: Joi.number().label('Status').required(),
            photo: Joi.any(),
            account_no: Joi.any(),
            card_no: Joi.any(),
            cif_id: Joi.any(),
        }

        rules = {...rules, ...additionalRule};

        return Joi.object(rules);
    }

    async updateUser() {

        this.setState({submitLoading: true});
        this.setState({errors: null});
        let additionalRule = {
            password: Joi.string().allow('', null).min(3).label('Password'),
            confirm_password: Joi.any().equal(Joi.ref('password'))
                .label('Confirm password')
                .messages({'any.only': '{{#label}} does not match'})
        };
        let schema = this.validateUserData(additionalRule);

        try {

            const data = await schema.validateAsync(this.state.userFormData);
            let formData = this.makeformData(data);
            formData.append('_method', "PUT");
            let response = await (new Api()).call('POST', API_URL + '/users/' + this.state.targetedUser.userId, formData, (new Token()).get());
            let specialPermissionResponse = await (new Api()).call('POST', API_URL + '/user/specialPermissions/' + this.state.targetedUser.userId, this.state.permissionGroupData, (new Token()).get());
            if (response.data.status == 200) {
                this.makeTableData(this.state.pageNumber);
                this.resetModal();
                notification.success({
                    message: 'Successfully Updated',
                    description: 'Data Successfully Updated Now',
                    placement:'bottomRight'
                })

            } else if (response.data.status == 400 || response.data.status == 424) {
                this.setState({submitLoading: false});
                this.setState({errors: (this.Helper.arrayToErrorMessage(response.data.errors))});
            }

        } catch (err) {
            const {validationError} = this.state;
            this.setState({submitLoading: false});
            validationError[err.details[0].context.key] = err.details[0].message;
            this.setState({validationError: validationError});
            validationError[err.details[0].context.key] = '';
        }

    }

    async createUser() {

        this.setState({submitLoading: true});
        this.setState({errors: null});
        let additionalRule = {
            password: Joi.string().allow('', null).min(3).label('Password').required(),
            confirm_password: Joi.any().equal(Joi.ref('password'))
                .required()
                .label('Confirm password')
                .messages({'any.only': '{{#label}} does not match'})
        };
        let schema = this.validateUserData(additionalRule);

        try {

            let data = await schema.validateAsync(this.state.userFormData);
            let formData = this.makeformData(data);
            let response = await (new Api()).call('POST', API_URL + '/users', formData, (new Token()).get());
            if (response.data.status == 200) {
                this.makeTableData(this.state.pageNumber);
                this.resetModal();
                notification.success({
                    message: 'New User Created Successfully!',
                    description: 'Data Successfully Updated Now',
                    placement:'bottomRight'
                })
            } else if (response.data.status == 400) {
                this.setState({submitLoading: false});
                this.setState({errors: (this.Helper.arrayToErrorMessage(response.data.errors))});
            }

        } catch (err) {
            const {validationError} = this.state;
            this.setState({submitLoading: false});
            validationError[err.details[0].context.key] = err.details[0].message;
            this.setState({validationError: validationError});
            validationError[err.details[0].context.key] = '';
        }

    }

    makeformData(data) {
        let formData = new FormData();
        formData.append('first_name', data.first_name);
        formData.append('middle_name', data.middle_name);
        formData.append('last_name', data.last_name);
        formData.append('account_no', data.account_no);
        formData.append('card_no', data.card_no);
        formData.append('cif_id', data.cif_id);
        formData.append('address', data.address);
        formData.append('email', data.email);
        formData.append('mobile', data.mobile);
        formData.append('roles', data.roles);
        formData.append('username', data.username);
        formData.append('image', data.photo);
        formData.append('password', data.password);
        formData.append('confirm_password', data.confirm_password);
        formData.append('status', data.status);
        return formData;
    }

    addNew() {
        this.setState({actionType: 'create'});
        this.setState({viewSpinning: true});
        this.setState({viewModalTitle: "Add New User"});
        this.resetUserData();
        this.generateRolesOption();
        this.setState({isViewModalVisible: true});
        this.setState({viewSpinning: false});
        this.setState({isViewTableReady: true});
    }

    photoOnChange(e) {
        const photo = e.target.files[0];
        let {userFormData} = this.state;
        userFormData.photo = photo;
        this.setState({userFormData: userFormData});
    }

    statusOnChange(checked, event) {
        let {userFormData} = this.state;
        userFormData.status = checked ? 1 : 0;
        this.setState({userFormData: userFormData});
    }

    resetUserData() {

        let {userFormData} = this.state;
        for (var key in userFormData) {
            userFormData[key] = '';
        }
        userFormData.status = 0;
        this.setState({userFormData});

        let {permissionGroupData} = this.state;
        permissionGroupData.map((permissionGroup) => {
            permissionGroup.permissions.map((permission) => {
                permission.isPermissionGiven = false;
                permission.isRoleBasePermission = false;
            });
            permissionGroup.isAllRoleBasePermission = false;
            permissionGroup.isAllPemission = false;
        });
        this.setState({permissionGroupData: permissionGroupData});

    }

    viewAction(id) {
        this.setState({viewSpinning: true});
        this.setState({viewModalTitle: "User Details"});
        this.setState({isViewModalVisible: true});
        this.setState({actionType: 'view'});
        let user = this.state.usersData.find(user => user.userId === id);
        this.getUserSpecialPermissions(user);
        this.setState({viewUserInfo: user});
        this.setState({viewSpinning: false});
        this.setState({isViewTableReady: true});
    }

    onChangeHandler = (event, key) => {
        const {userFormData} = this.state;
        userFormData[event.target.name] = event.target.value;
        this.setState({userFormData});
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
                let response = await (new Api()).call('DELETE', API_URL + '/users/' + id, [], (new Token()).get());
                if (response.data.status == 200) {
                    this.makeTableData(this.state.pageNumber);
                    this.resetModal();
                    notification.success({
                        message: 'Successfully Deleted!',
                        description: 'Data Successfully Deleted',
                        placement:'bottomRight'
                    })
                } else if (response.data.status == 400) {
                    this.setState({submitLoading: false});
                    this.setState({errors: (this.Helper.arrayToErrorMessage(response.data.errors))});
                }
            }
        });
    }

    makeTableData(page = null, query = '') {
        let data = [];
        let helper = new Helper();
        let isEditPermitted = (new Auth).isPermitted('user-edit');
        let isDeletePermitted = (new Auth).isPermitted('user-delete');
        this.getPermissions();
        this.getAllRoles();
        this.getAllGroups();
        const currentUserInfo = this.state.user_info;
        this.getUsers(this.state.pageNumber, query).then((response) => {
            if (response.data.user_list) {
                this.setState({serialCount: response.data.user_list.from});
                response.data.user_list.data.map((user) => {
                    let roles = helper.objectsColumnToCsv(user.roles, 'name');
                    let roleIds = [];
                    user.roles.map((role) => {
                        roleIds.push(role.id);
                    });
                    let groups = helper.objectsColumnToCsv(user.groups, 'name');
                    let groupIds = [];
                    user.groups.map((group) => {
                        groupIds.push(group.id);
                    });
                    
                    data.push({
                        id: this.state.serialCount,
                        userId: user.id,
                        currentLoggedInUser: this.state.user_info,
                        url: user.media ? user.media.url : '',
                        first_name: user.first_name,
                        isSpecialPermission: user.permissions.length != 0 ? true : false,
                        last_name: user.last_name,
                        middle_name: user.middle_name,
                        account_no: user.account_no,
                        card_no: user.card_no,
                        cif_id: user.cif_id,
                        email: user.email,
                        mobile: user.mobile,
                        address: user.address,
                        roles: roles,
                        groups: groups,
                        roleIds: roleIds,
                        status: user.status ?? 0,
                        username: user.username,
                        action: <>
                            {this.getAuthorizeAction(currentUserInfo.roles, user.roles)?
                                <>
                                    { this.props.userType === undefined && this.props.userType != 'nonUser' ? 
                                        <div>
                                            <ul className="list-inline m-0">
                                                <ActionButtons
                                                    viewActionProp={() => this.viewAction(user.id)}
                                                    editActionProp={() => this.editAction(user.id)}
                                                    deleteActionProp={() => this.deleteAction(user.id)}
                                                    isEditPermitted={isEditPermitted}
                                                    isDeletePermitted={isDeletePermitted}
                                                />
                                            </ul>
                                        </div>
                                        : '-'
                                    }
                                </>
                                :null
                            }
                            
                        </>
                    });
                    this.setState({serialCount: (this.state.serialCount + 1)});
                    return 1;
                });
                this.setState({pageCount: response.data.user_list.last_page});
            }

            this.setState({usersData: data});
            // console.log(data,this.state.user_info);
            this.setState({dataTableSpinning: false});

        });

    }

    getAuthorizeAction(currentUsersRole, listUsersRole)
    {
        let currentUserRoleIds = [];
        let listUserRoleIds = [];
        currentUsersRole.map((item)=>{
            currentUserRoleIds.push(item.id);
        });
        listUsersRole.map((item)=>{
            listUserRoleIds.push(item.id);
        });
        if(currentUserRoleIds.indexOf(1) != -1){
            return true;
        }else if(listUserRoleIds.indexOf(1) != -1){
            return false;
        }else{
            return true;
        }
    }

    getModalView() {
        const permissionsList = <>
            <div className="col-md-12 mb-3 mt-3">
                <h3><u>Special Permissions</u></h3>
                <PermissionList
                    permissionGroupData={this.state.permissionGroupData}
                    actionType={this.state.actionType}
                    handleAllChecked={this.handleAllChecked}
                    handlePermissionOnChange={this.handlePermissionOnChange}
                />
            </div>
        </>
        if (this.state.actionType == "view") {

            return <>
                <div className="ts-d-u-profile-preview-card">

                    <div className="ts-d-u-preview-avatar text-center">
                        {this.state.viewUserInfo.url ?
                            <img className="img-fluid" src={this.state.viewUserInfo.url}
                                 alt={'avatar'}/> : 'No Photo Given!'}
                    </div>
                    <div className="ts-d-u-profile-single-row-area">
                        <div className="ts-d-u-profile-single-row">
                            <span>First Name</span>
                            <span>{this.state.viewUserInfo.first_name}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Middle Name</span>
                            <span>
                                {this.state.viewUserInfo.middle_name}
                            </span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>
                                Last Name
                            </span>
                            <span>
                                {this.state.viewUserInfo.last_name}
                            </span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Username</span>
                            <span>{this.state.viewUserInfo.username}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Account Number</span>
                            <span>{this.state.viewUserInfo.account_no}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Card Number</span>
                            <span>{this.state.viewUserInfo.card_no}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>CIF ID</span>
                            <span>{this.state.viewUserInfo.cif_id}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Email</span>
                            <span>{this.state.viewUserInfo.email}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Mobile</span>
                            <span>{this.state.viewUserInfo.mobile}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Address</span>
                            <span>{this.state.viewUserInfo.address}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Roles</span>
                            <span>{this.state.viewUserInfo.roles}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Group</span>
                            <span>{this.state.viewUserInfo.groups}</span>
                        </div>
                        <div className="ts-d-u-profile-single-row">
                            <span>Status</span>
                            <span>{this.state.viewUserInfo.status == 1 ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>

                </div>
                {permissionsList}

            </>

        } else {

            return <form className="row g-3 needs-validation" autoComplete='off' encType="multipart/form-data">
                <div className="col-md-4 mb-3">
                    <label className="form-label">First name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="first_name"
                           value={this.state.userFormData.first_name} id="first_name" placeholder="First Name"
                           onChange={this.onChangeHandler}/>
                    <div className="text-danger">{this.state.validationError.first_name}</div>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Middle name</label>
                    <input type="text" className="form-control" name="middle_name"
                           value={this.state.userFormData.middle_name} id="middle_name" placeholder="Middle Name"
                           onChange={this.onChangeHandler}/>
                    <div className="text-danger">{this.state.validationError.middle_name}</div>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Last name</label>
                    <input type="text" className="form-control" name="last_name"
                           value={this.state.userFormData.last_name} id="last_name" placeholder="Last Name"
                           onChange={this.onChangeHandler}/>
                    <div className="text-danger">{this.state.validationError.last_name}</div>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Email <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="email" value={this.state.userFormData.email}
                           id="email" placeholder="Email" onChange={this.onChangeHandler}/>
                    <div className="text-danger">{this.state.validationError.email}</div>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Mobile <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="mobile" value={this.state.userFormData.mobile}
                           id="mobile" placeholder="Mobile" onChange={this.onChangeHandler}/>
                    <div className="text-danger">{this.state.validationError.mobile}</div>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Roles <span className="text-danger">*</span></label>
                    {
                        this.state.actionType == 'edit' ?
                            <Select
                                mode="multiple"
                                style={{width: '100%'}}
                                placeholder="Select One"
                                defaultValue={this.state.roleSelected}
                                onChange={this.handleRolesSelect}
                                optionLabelProp="label"
                            >
                                {this.state.roleChildren}
                            </Select>
                            : ''
                    }

                    {
                        this.state.actionType == 'create' ?
                            <Select
                                mode="multiple"
                                style={{width: '100%'}}
                                placeholder="Select One"
                                onChange={this.handleRolesSelect}
                                optionLabelProp="label"
                            >
                                {this.state.roleChildren}
                            </Select>
                            : ''
                    }


                    <div className="text-danger">{this.state.validationError.roles}</div>
                </div>

                <div className="col-md-12 mb-3">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control" name="address" value={this.state.userFormData.address}
                        id="address" placeholder="Address" onChange={this.onChangeHandler}/>
                    <div className="text-danger">{this.state.validationError.address}</div>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Photo</label>
                    <input type="file" name="photo" className="form-control-file" id="exampleFormControlFile1"
                           onChange={(e) => this.photoOnChange(e)}/>
                </div>

                <div className="col-md-4 mb-3">
                    {this.state.actionType == 'edit' && this.state.targetedUser.url ?
                        <>
                            <label className="form-label d-block">Given Photo</label>
                            <img className="img-fluid ts-d-u-given-photo" src={this.state.targetedUser.url}
                                 alt={'avatar'}/>
                        </>
                        : ''}
                </div>

                {/*Empty Div For Design Purpose*/}
                <div className="col-md-4 mb-3"></div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Username <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="username" value={this.state.userFormData.username}
                           id="username" placeholder="Username" onChange={this.onChangeHandler}/>
                    <div className="text-danger">{this.state.validationError.username}</div>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Password {this.state.actionType == 'create' ?
                        <span className="text-danger">*</span> : ''}</label>
                    <input type="password" className="form-control" name="password"
                           value={this.state.userFormData.password} id="password" placeholder="Password"
                           onChange={this.onChangeHandler}/>
                    <div className="text-danger">{this.state.validationError.password}</div>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label">Confirm Password {this.state.actionType == 'create' ?
                        <span className="text-danger">*</span> : ''}</label>
                    <input type="password" className="form-control" name="confirm_password"
                           value={this.state.userFormData.confirm_password} id="confirm_password"
                           placeholder="Confirm Password" onChange={this.onChangeHandler}/>
                    <div className="text-danger">{this.state.validationError.confirm_password}</div>
                </div>

                <div className="col-md-4 mb-3">
                    <label className="form-label d-block">Status</label>
                    <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        onChange={this.statusOnChange}
                        defaultChecked={this.state.userFormData.status == 1 ? true : false}
                    />
                </div>
                {this.state.actionType !== 'create' ? permissionsList : null}
            </form>

        }
    }

    onSearch = (e) => {
        // console.log(e.target.value);
        let {search_query} = this.state;
        search_query = e.target.value;
        this.setState({search_query}, () => {
            setTimeout(() => {
                this.makeTableData('', this.state.search_query);
            }, 500)
        })
    }


    render() {
        let {locationPath} = this.state
        return (
            <>
                <Modal
                    zIndex="1050"
                    centered
                    title={this.state.viewModalTitle}
                    visible={this.state.isViewModalVisible}
                    onOk={this.handleOk}
                    confirmLoading={this.state.confirmViewLoading}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                            Close
                        </Button>,
                        <Button
                            className={this.state.actionType == "view" ? "d-none" : ""}
                            loading={this.state.submitLoading}
                            key="Update"
                            type="primary"
                            onClick={this.state.actionType == "edit" ? () => this.updateUser() : () => this.createUser()}
                        >
                            Submit
                        </Button>
                    ]}
                    bodyStyle={{paddingLeft: '5vmin', paddingRight: '5vmin'}}
                    onCancel={this.handleCancel}>

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
                        {this.state.isViewTableReady ? this.getModalView() : ''}
                    </div>
                </Modal>
                <div className="ts-d-top-header mb-4">
                    <div className="ts-d-acc-name">
                        <span className="bi bi-list"/>
                        <span className="ts-d-acc-name-text text-uppercase"> Users</span>
                    </div>

                    <div className="form-group m-0">
                        <ul className="list-inline m-0">
                            <li className="list-inline-item">
                                {
                                    (new Auth).isPermitted('user-create') ?
                                        <AddActionButtons addActionProp={() => this.addNew()}/>
                                        : null
                                }
                            </li>
                        </ul>
                    </div>
                </div>

                <BreadCrumbs locationPath={locationPath}/>

                <div className="container-fluid p-0 mb-4">

                    <div className="ts-d-search-area mx-0">
                        <Input
                            suffix={<SearchOutlined type="search"/>}
                            placeholder="Search here"
                            size="large"
                            value={this.state.search_query || ''}
                            onChange={this.onSearch}
                        />
                    </div>
                </div>

                <div className="container-fluid">
                    <div className="ts-d-common-list-view  shadow-sm bg-white">
                        <DataTable
                            columns={this.state.columns}
                            data={this.state.usersData}
                            noDataComponent={<Spin size="medium" tip="Getting Data..."
                                                   spinning={this.state.dataTableSpinning}></Spin>}
                            striped={true}
                            highlightOnHover={true}
                        />
                    </div>
                </div>
                <Pagination pageCount={this.state.pageCount} handlePageClick={this.handlePageClick}/>
            </>
        )
    }
}

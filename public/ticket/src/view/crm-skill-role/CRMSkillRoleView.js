import React, { Component } from 'react'
import AddActionButtons from '../../components/common/AddActionButton';
import BreadCrumbs from "../../components/common/BreadCrumbs";
import DataTable from 'react-data-table-component';
import { Modal, Button, Spin, Alert, message } from 'antd';
import Pagination from '../../components/Pagination/Pagination';
import Form from './Form';
import {API_URL,ANTD_MESSAGE_MARGIN_TOP, DELETE_TITLE} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Auth from '../../services/Auth';
import Helper from '../../services/Helper';
import ActionButtons from '../../components/common/ActionButtons';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm }   = Modal;

export default class CRMSkillRoleView extends Component {
  
    constructor(){
        super();
        this.state = {
            // Breadcrumb
            locationPath        : {
                base            : 'Dashboard',
                basePath        : '/',
                name            : 'CRM Skill Role',
                path            : 'crm-skill-role',
            },
            roles               : [],
            dataTableSpinning   : true,
            modalTitle          : '',
            isModalVisible      : false,
            errors              : null,
            submitLoading       : false,
            isModelViewReady    : false,
            actionType          : '',
            pageNumber          : 1,
            serialCount         : 1,
            targatedCrmSkillRole: '',
            crmSkillRoleFormData: {
                skill_id        : '',
                role_id         : null
            },
            columns : [
                /* {
                    name        : 'NO.',
                    selector    : row => row.id,
                    maxWidth    : "60px"
                }, */
                {
                    name        : 'Skill Id',
                    selector    : row => row.skill_id,
                },
                {
                    name        : 'Role',
                    selector    : row => row.role_name,
                },
                {
                    name        : 'Action',
                    selector    : row => row.action,
                    maxWidth    : "160px"
                }
            ],
            crmSkillRoleData : []
        }

        this.createNew              = this.createNew.bind(this);
        this.handleRoleSelect      = this.handleRoleSelect.bind(this);
        this.updateCrmSkillRole         = this.updateCrmSkillRole.bind(this);
        this.handlePageClick        = this.handlePageClick.bind(this);
        this.inputOnChangeHandler   = this.inputOnChangeHandler.bind(this);
    }

    handleCancel = () => {
        this.resetModal();
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData()
        });
    }

    async getCrmSkillRoleList() {
        return await (new Api()).call('GET', API_URL + '/crm/crm-skill-role?page=' + this.state.pageNumber, [], (new Token()).get());
    }

    editAction(id){
        
        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'edit'});
        this.setState({modalTitle: "Edit CRM Skill Role"});

        let targatedCrmSkillRole = this.state.crmSkillRoleData.find(skillRole => skillRole.id === id);
        let crmSkillRoleFormData = {};

        for(var key in this.state.crmSkillRoleFormData) {
            crmSkillRoleFormData[key] = targatedCrmSkillRole[key] == null ? '' : targatedCrmSkillRole[key];
        }
        
        this.setState({crmSkillRoleFormData: crmSkillRoleFormData});
        
        this.setState({targatedCrmSkillRole}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    addAction(){

        this.setState({isModalVisible   : true});
        this.setState({modalTitle       : "Add New Skill Role"});
        this.setState({actionType       : "create"});

        let crmSkillRoleFormData = {};
        for (var key in this.state.crmSkillRoleFormData) {
            crmSkillRoleFormData[key] = '';
        }
        
        this.setState({crmSkillRoleFormData}, ()=>{
            this.setState({viewSpinning     : false});
            this.setState({isModelViewReady : true});
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
                let response = await (new Api()).call('DELETE', API_URL + '/crm/crm-skill-role/' + id, [], (new Token()).get());
                if (response.data.status_code == 200) {
                    this.makeTableData();
                    this.resetModal();
                    message.success({
                        content: 'Deleted Successfully.',
                        style: {
                            marginTop: ANTD_MESSAGE_MARGIN_TOP,
                        }
                    });
                } else if (response.data.status_code == 424) {
                    this.setState({submitLoading: false});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
                } else if (response.data.status_code === 620) {
                    this.setState({submitLoading: false});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))},()=>{
                        this.makeTableData();
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
        this.setState({isModalVisible   : false});
        this.setState({submitLoading    : false});
        this.setState({isModelViewReady : false});
        this.setState({viewSpinning     : false});
        this.setState({errors           : null});
    }

    inputOnChangeHandler(event){
        const {crmSkillRoleFormData} = this.state;
        crmSkillRoleFormData[event.target.name] = event.target.value;
        this.setState({crmSkillRoleFormData});
    }

    handleRoleSelect(value){
        const {crmSkillRoleFormData} = this.state;
        crmSkillRoleFormData.role_id = value;
        this.setState({crmSkillRoleFormData});
    }

    async createNew(){

        this.setState({submitLoading: true});
        let response = await (new Api()).call('POST', API_URL + `/crm/crm-skill-role`, this.state.crmSkillRoleFormData, (new Token()).get());
        if (response.data.status_code == 201) {

            this.makeTableData();
            this.resetModal();
            message.success({
                content: 'Created Successfully.',
                style: {
                    marginTop: ANTD_MESSAGE_MARGIN_TOP,
                }
            });

        } else if (response.data.status_code == 400) {

            this.setState({submitLoading: false});
            this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});

        }

    }

    async updateCrmSkillRole(){
        this.setState({submitLoading: true});
        let response = await (new Api()).call('PUT', API_URL + `/crm/crm-skill-role/` + this.state.targatedCrmSkillRole.id, this.state.crmSkillRoleFormData, (new Token()).get());

        if (response.data.status_code == 200) {

            this.makeTableData();
            this.resetModal();
            message.success({
                content: 'Updated Successfully.',
                style: {
                    marginTop: ANTD_MESSAGE_MARGIN_TOP,
                }
            });

        } else if (response.data.status_code == 400) {

            this.setState({submitLoading: false});
            this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});

        }
    }

    async getAllRoles() {
        return await (new Api()).call('GET', API_URL + '/getList/roles?page=*', [], (new Token()).get());
    }

    componentDidMount() {
        let roles = this.getAllRoles();
        roles.then((response)=>{
            this.setState({roles: response});
            this.makeTableData();
        });
    }

    makeTableData(){
        let data=[];
        let helper = new Helper();
        let isEditPermitted = (new Auth).isPermitted('crm-skill-role-edit');
        let isDeletePermitted = (new Auth).isPermitted('crm-skill-role-delete');
        
        this.getCrmSkillRoleList().then((response) => {
            //alert(isDeletePermitted);
            if (response.data.collections) {
                this.setState({serialCount: response.data.collections.from});
                response.data.collections.data.map((crmSkillRole) => {
                    data.push({
                        id          : crmSkillRole.id,
                        serial      : this.state.serialCount,
                        skill_id    : crmSkillRole.skill_id,
                        role_id     : crmSkillRole.role_id,
                        role_name   : this.state.roles.data.role_list.find((role)=> role.id == crmSkillRole.role_id)['name'],
                        action      :<>
                                        <div>
                                            <ul className="list-inline m-0">
                                                <ActionButtons
                                                    editActionProp      ={()=>this.editAction(crmSkillRole.id)}
                                                    deleteActionProp    ={()=>this.deleteAction(crmSkillRole.id)}
                                                    isEditPermitted     ={isEditPermitted}
                                                    isDeletePermitted   ={isDeletePermitted}
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

            this.setState({crmSkillRoleData: data});
            this.setState({dataTableSpinning: false});

        });

    }

    getModalView(){

        return <Form
                    inputOnChangeHandler    = {this.inputOnChangeHandler}
                    handleRoleSelect       = {this.handleRoleSelect}
                    crmSkillRoleFormData    = {this.state.crmSkillRoleFormData}
                    roles                   = {this.state.roles}
                />

    }

    render() {
        let {locationPath} = this.state
        return (
            <>
                <Modal
                    width="50%"
                    zIndex="1050"
                    title={this.state.modalTitle}
                    visible={this.state.isModalVisible}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button
                            key="back"
                            onClick={this.handleCancel}
                        >
                            Close
                        </Button>,
                        <Button
                            className={ this.state.actionType == "view" ? "d-none" : ""}
                            loading ={this.state.submitLoading}
                            key     ="Submit"
                            type    ="primary"
                            onClick ={this.state.actionType == "edit" ? () => this.updateCrmSkillRole() : () => this.createNew()}
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
                        <span className={"ts-d-acc-name-text text-uppercase"}> CRM Skill List</span>
                    </div>

                    <div className={"form-group m-0"}>
                        {
                            (new Auth).isPermitted('crm-skill-role-create') ?
                                <AddActionButtons addActionProp={() => this.addAction()} />
                                : null
                        }
                    </div>
                </div>
                <BreadCrumbs locationPath={locationPath}/>

                <div className="container-fluid">

                    <div className={"ts-d-common-list-view"}>
                        <DataTable
                            columns={this.state.columns}
                            data={this.state.crmSkillRoleData}
                            noDataComponent={<Spin size="midium" tip="Getting Data..." spinning={this.state.dataTableSpinning}></Spin>}
                            striped={true}
                            highlightOnHover={true}
                        />
                    </div>

                </div>

                {this.state.pageCount > 1 ? <Pagination pageCount={this.state.pageCount} handlePageClick={this.handlePageClick}/> : null }
            </>
        )
    }
}

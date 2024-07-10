import React, { Component } from 'react'
import AddActionButtons from '../../components/common/AddActionButton';
import BreadCrumbs from "../../components/common/BreadCrumbs";
import DataTable from 'react-data-table-component';
import { Modal, Button,AutoComplete, Input, Spin, Select, Alert, message } from 'antd';
import Pagination from '../../components/Pagination/Pagination';
import Form from './Form';
import View from './View';
import {API_URL, ANTD_MESSAGE_MARGIN_TOP, DELETE_TITLE} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Auth from '../../services/Auth';
import Helper from '../../services/Helper';
import ActionButtons from '../../components/common/ActionButtons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';

const { Option }    = Select;
const { confirm }   = Modal;

export default class GroupView extends Component {

    constructor(){
        super();
        this.state = {
            //breadcrumb
            locationPath                        : {
                base                            : 'Dashboard',
                basePath                        : '/',
                name                            : 'Group List',
                path                            : 'groups',
            },
            dataTableSpinning   : false,
            modalTitle          : '',
            isModalVisible      : false,
            allAgents           : null,
            agentSelectOptions  : null,
            errors              : null,
            submitLoading       : false,
            isModelViewReady    : false,
            actionType          : '',
            pageNumber          : 1,
            serialCount         : 1,
            targetedGroup       : '',
            selectedAgents      : [],
            groupFormData        : {
                groupId         : '',
                parent_id       : 0,
                name            : '',
                description     : '',
                agents          : '',
                need_ticket_approval: 0
            },
            columns : [
                {
                    name        : 'NO.',
                    selector    : row => row.id,
                    maxWidth    : "60px"
                },
                {
                    name        : 'Name',
                    selector    : row => row.nameAndDesc,
                },
                {
                    name        : 'Agents',
                    selector    : row => row.agentsCount,
                },
                {
                    name        : 'Action',
                    selector    : row => row.action,
                    maxWidth    : "160px"
                }
            ],
            groupsData : []
        }
        this.handleAgentsInput  = this.handleAgentsInput.bind(this);
        this.createNew          = this.createNew.bind(this);
        this.updateGroup        = this.updateGroup.bind(this);
        this.handlePageClick    = this.handlePageClick.bind(this);
        this.handleTicketApproval= this.handleTicketApproval.bind(this);
    }

    handleCancel = () => {
        this.resetModal();
    }

    handleSelectOnChange = (target, value) => {
        let {groupFormData} = this.state;
        groupFormData[target] = value;
        this.setState({groupFormData});
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData()
        });
    }

    async getAgents(){
        let _this = this;
        let response = await (new Api()).call('GET', API_URL + `/user/getByRole/agent`, [], (new Token()).get());
        this.setState({allAgents: response.data.users}, ()=>{
            _this.generateAgentSelectOption();
        });
    }

    async getGroups_backup() {
        return await (new Api()).call('GET', API_URL + '/groups?page=' + this.state.pageNumber, [], (new Token()).get());
    }

    async getGroups(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/groups?page=' + this.state.pageNumber, [], (new Token()).get(),this.params);
        } else{
            return await (new Api()).call('GET', API_URL + '/groups?page=' + this.state.pageNumber + '&query='+ query, [], (new Token()).get());
        }

    }


    viewAction(id){
        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'view'});
        this.setState({modalTitle : "Group Details"});

        let targetedGroup = this.state.groupsData.find(group => group.groupId === id);

        this.setState({targetedGroup}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    editAction(id){

        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'edit'});
        this.setState({modalTitle : "Edit Group"});

        let targetedGroup = this.state.groupsData.find(group => group.groupId === id);
        let groupFormData    = {};
        let selectedAgents  = [];

        for (var key in this.state.groupFormData) {
            groupFormData[key] = targetedGroup[key] == null ? '' : targetedGroup[key];
            // if (key === 'parent_id'){
            //     groupFormData[key] = groupFormData[key] == null ? 0 : targetedGroup[key];
            // } else{
            //     groupFormData[key] = groupFormData[key] == null ? '' : targetedGroup[key];
            // }
        }
        targetedGroup.agents.map((agent)=>{
            selectedAgents.push(agent.id.toString());
        });
        groupFormData.agents = selectedAgents;
        this.setState({targetedGroup});
        this.setState({groupFormData: groupFormData});
        this.setState({selectedAgents}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    addAction(){

        this.setState({isModalVisible   : true});
        this.setState({modalTitle       : "Add New Group"});
        this.setState({actionType       : "create"});

        let groupFormData = {};
        for (var key in this.state.groupFormData) {
            // groupFormData[key] = '';
            if (key === 'parent_id' || key === 'need_ticket_approval'){
                groupFormData[key] = 0;
            } else{
                groupFormData[key] = '';
            }
        }

        this.setState({selectedAgents : []});
        this.setState({groupFormData}, ()=>{
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
                let response = await (new Api()).call('DELETE', API_URL + '/groups/' + id, [], (new Token()).get());
                if (response.data.status == 200) {
                    this.makeTableData(this.state.pageNumber);
                    this.resetModal();
                    message.success({
                        content: 'Deleted Successfully.',
                        style: {
                            marginTop: ANTD_MESSAGE_MARGIN_TOP,
                        }
                    });
                } else if (response.data.status == 424) {
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

    generateAgentSelectOption(){

        const agentSelectOptions = [];
        this.state.allAgents.forEach((agent, index)=>{
            agentSelectOptions.push(<Option
                                        key={agent.id.toString()}
                                        value={agent.id.toString()}
                                        searchableData={agent.full_name + agent.email}
                                    >
                                        <div className="demo-option-label-item">
                                            <i className="bi bi-person-circle"></i>
                                            <strong> {agent.full_name}</strong> <br/> {agent.email}
                                        </div>
                                    </Option>);
        })
        this.setState({agentSelectOptions: agentSelectOptions});

    }

    resetModal() {
        this.setState({isModalVisible       : false});
        this.setState({submitLoading        : false});
        this.setState({isModelViewReady     : false});
        this.setState({viewSpinning         : false});
        this.setState({errors               : null});
    }

    handleAgentsInput(value){
        let {groupFormData} = this.state;
        groupFormData.agents = value;
        this.setState({groupFormData: groupFormData});
    }

    onChangeHandler = (event, key) => {
        const {groupFormData} = this.state;
        groupFormData[event.target.name] = event.target.value;
        this.setState({groupFormData});
    }

    handleTicketApproval(value){
        const {groupFormData} = this.state;
        groupFormData.need_ticket_approval = value ? 1 : 0;
        this.setState({groupFormData});
    }

    async createNew(){

        this.setState({submitLoading: true});
        let response = await (new Api()).call('POST', API_URL + `/groups`, this.state.groupFormData, (new Token()).get());
        if (response.data.status == 201) {

            this.makeTableData(this.state.pageNumber);
            this.resetModal();
            message.success({
                content: 'New Created Successfully.',
                style: {
                    marginTop: ANTD_MESSAGE_MARGIN_TOP,
                }
            });

        } else if (response.data.status == 400) {

            this.setState({submitLoading: false});
            this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});

        }

    }

    async updateGroup(){

        this.setState({submitLoading: true});
        let response = await (new Api()).call('PUT', API_URL + `/groups/` + this.state.targetedGroup.groupId, this.state.groupFormData, (new Token()).get());
        if (response.data.status == 200) {

            this.makeTableData(this.state.pageNumber);
            this.resetModal();
            message.success({
                content: 'Updated Successfully.',
                style: {
                    marginTop: ANTD_MESSAGE_MARGIN_TOP,
                }
            });

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

    componentDidMount() {
        this.makeTableData();
        this.getAgents();
    }

    makeTableData(page = null, query = ''){
        let data=[];
        let helper = new Helper();
        let isEditPermitted = (new Auth).isPermitted('group-edit');
        let isDeletePermitted = (new Auth).isPermitted('group-delete');

        this.setState({dataTableSpinning: true});
        this.getGroups(this.state.pageNumber).then((response) => {
            if (response.data.group_list) {
                this.setState({serialCount: response.data.group_list.from});
                response.data.group_list.data.map((group) => {

                    data.push({
                        id                  : this.state.serialCount,
                        groupId             : group.id,
                        name                : group.name,
                        parent_id           : group.parent_id,
                        description         : group.description,
                        nameAndDesc         : group.name + '\n' + (group.description != null ? group.description : '') ,
                        agentsCount         : group.users.length,
                        agents              : group.users,// Agents
                        need_ticket_approval: group.need_ticket_approval,
                        action      :<>
                                        <div>
                                            <ul className="list-inline m-0">
                                                <ActionButtons
                                                    viewActionProp  ={()=>this.viewAction(group.id)}
                                                    editActionProp  ={()=>this.editAction(group.id)}
                                                    deleteActionProp={()=>this.deleteAction(group.id)}
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
                this.setState({pageCount: response.data.group_list.last_page});
            }

            this.setState({groupsData: data});
            this.setState({dataTableSpinning: false});

        });

    }

    getModalView(){

        if (this.state.actionType != "view") {
            return <Form
                        agentSelectOptions      = {this.state.agentSelectOptions}
                        handleAgentsInput       = {this.handleAgentsInput}
                        onChangeHandler         = {this.onChangeHandler}
                        groupFormData           = {this.state.groupFormData}
                        selectedAgents          = {this.state.selectedAgents}
                        handleSelectOnChange    = {this.handleSelectOnChange}
                        handleTicketApproval    = {this.handleTicketApproval}
                    />
        }else{
            return <View
                        targetedGroup = {this.state.targetedGroup}
                        groups = {this.state.groupsData}
                    />
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
                            className={ this.state.actionType == "view" ? "d-none" : ""}
                            loading ={this.state.submitLoading}
                            key     ="Submit"
                            type    ="primary"
                            onClick ={this.state.actionType == "edit" ? () => this.updateGroup() : () => this.createNew()}
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
                        <span className={"ts-d-acc-name-text text-uppercase"}> Group List</span>
                    </div>

                    <div className={"form-group m-0"}>
                        {
                            (new Auth).isPermitted('group-create') ?
                                <AddActionButtons addActionProp={() => this.addAction()} />
                                : null
                        }
                    </div>
                </div>
                <BreadCrumbs locationPath={locationPath}/>

                   {/*Search Components*/}
                   <div className="container-fluid p-0 mb-4">
                    <div className="ts-d-search-area mx-0">
                        <AutoComplete
                            style={{ width: '100%',}}
                            option={this.state.groupsData.map(({name})=>name)}
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

                    <div className={"ts-d-common-list-view"}>
                        <DataTable
                            columns={this.state.columns}
                            data={this.state.groupsData}
                            noDataComponent={<Spin size="midium" tip="Getting Data..." spinning={this.state.dataTableSpinning}></Spin>}
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

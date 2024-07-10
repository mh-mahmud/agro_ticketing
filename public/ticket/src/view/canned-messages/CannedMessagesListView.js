import React, { Component } from 'react'
import Layout from "../../components/common/Layout";
import BreadCrumbs from "../../components/common/BreadCrumbs";
import AddActionButtons from '../../components/common/AddActionButton';
import DataTable from 'react-data-table-component';
import { Modal, Button,AutoComplete, Input, Spin, Select, Alert, message } from 'antd';
import Pagination from '../../components/Pagination/Pagination';
import Form from './Form';
import View from './View';
import {API_URL,ANTD_MESSAGE_MARGIN_TOP, DELETE_TITLE} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Auth from '../../services/Auth';
import Helper from '../../services/Helper';
import ActionButtons from '../../components/common/ActionButtons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';

const { Option }    = Select;
const { confirm }   = Modal;

export default class CannedMessagesListView extends Component {

    constructor(){
        super();
        this.state = {
             //breadcrumb
             locationPath                        : {
                base                            : 'Dashboard',
                basePath                        : '/',
                name                            : 'Canned Message List',
                path                            : 'canned-messages',
            },
            dataTableSpinning   : true,
            modalTitle          : '',
            isModalVisible      : false,
            errors              : null,
            submitLoading       : false,
            isModelViewReady    : false,
            actionType          : '',
            pageNumber          : 1,
            serialCount         : 1,
            targetedCannedMsg   : '',
            cannedMsgFormData   : {
                title            : '',
                description     : '',

            },
            columns : [
                {
                    name        : 'NO.',
                    selector    : row => row.id,
                    maxWidth    : "60px"
                },
                {
                    name        : 'Title',
                    selector    : row => row.title,
                },
                {
                    name        : 'Description',
                    selector    : row => row.description,
                },


                {
                    name        : 'Action',
                    selector    : row => row.action,
                    maxWidth    : "160px"
                }
            ],
            cannedMessagesData : []
        }

        this.createNew          = this.createNew.bind(this);
        this.updateCannedMsg        = this.updateCannedMsg.bind(this);
        this.handlePageClick    = this.handlePageClick.bind(this);
    }

    handleCancel = () => {
        this.resetModal();
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData()
        });
    }


    async getCannedMessages_backup() {
        return await (new Api()).call('GET', API_URL + '/canned-messages?page=' + this.state.pageNumber, [], (new Token()).get());
    }

    async getCannedMessages(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/canned-messages?page=' + this.state.pageNumber, [], (new Token()).get(),this.params);
        } else{
            return await (new Api()).call('GET', API_URL + '/canned-messages?page=' + this.state.pageNumber + '&query='+ query, [], (new Token()).get());
        }

    }


    viewAction(id){
        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'view'});
        this.setState({modalTitle : "Canned Message Details"});

        let targetedCannedMsg = this.state.cannedMessagesData.find(canned_message => canned_message.groupId === id);

        this.setState({targetedCannedMsg}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    editAction(id){

        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'edit'});
        this.setState({modalTitle : "Edit Canned Message"});

        let targetedCannedMsg = this.state.cannedMessagesData.find(canned_message => canned_message.groupId === id);
        let cannedMsgFormData    = {};
        // let selectedAgents  = [];

        for (var key in this.state.cannedMsgFormData) {
            cannedMsgFormData[key] = targetedCannedMsg[key] == null ? '' : targetedCannedMsg[key];
        }
        // targetedCannedMsg.agents.map((agent)=>{
        //     selectedAgents.push(agent.id.toString());
        // });
        // cannedMsgFormData.agents = selectedAgents;
        this.setState({targetedCannedMsg});
        this.setState({cannedMsgFormData: cannedMsgFormData});
        // this.setState({isModelViewReady:true});
        // this.setState({viewSpinning:false});
        this.setState({targetedCannedMsg}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    addAction(){

        this.setState({isModalVisible   : true});
        this.setState({modalTitle       : "Add New Canned Message"});
        this.setState({actionType       : "create"});

        let cannedMsgFormData = {};
        for (var key in this.state.cannedMsgFormData) {
            cannedMsgFormData[key] = '';
        }
        // this.setState({selectedAgents : []});
        this.setState({cannedMsgFormData}, ()=>{
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
                let response = await (new Api()).call('DELETE', API_URL + '/canned-messages/' + id, [], (new Token()).get());
                if (response.data.status_code == 200) {
                    this.makeTableData(this.state.pageNumber);
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
                }
            }
        });

    }

    // generateAgentSelectOption(){

    //     const agentSelectOptions = [];
    //     this.state.allAgents.forEach((agent, index)=>{
    //         agentSelectOptions.push(<Option
    //                                     key={agent.id.toString()}
    //                                     value={agent.id.toString()}
    //                                     searchableData={agent.full_name + agent.email}
    //                                 >
    //                                     <div className="demo-option-label-item">
    //                                         <i className="bi bi-person-circle"></i>
    //                                         <strong> {agent.full_name}</strong> <br/> {agent.email}
    //                                     </div>
    //                                 </Option>);
    //     })
    //     this.setState({agentSelectOptions: agentSelectOptions});

    // }

    resetModal() {
        this.setState({isModalVisible       : false});
        this.setState({submitLoading        : false});
        this.setState({isModelViewReady     : false});
        this.setState({viewSpinning         : false});
        this.setState({errors               : null});
    }

    // handleAgentsInput(value){
    //     let {cannedMsgFormData} = this.state;
    //     cannedMsgFormData.agents = value;
    //     this.setState({cannedMsgFormData: cannedMsgFormData});
    // }

    onChangeHandler = (event, key) => {
        const {cannedMsgFormData} = this.state;
        cannedMsgFormData[event.target.name] = event.target.value;
        this.setState({cannedMsgFormData});
    }

    async createNew(){

        this.setState({submitLoading: true});
        let response = await (new Api()).call('POST', API_URL + `/canned-messages`, this.state.cannedMsgFormData, (new Token()).get());
        if (response.data.status_code == 201) {

            this.makeTableData(this.state.pageNumber);
            this.resetModal();
            message.success({
                content: 'New Created Successfully.',
                style: {
                    marginTop: ANTD_MESSAGE_MARGIN_TOP,
                }
            });

        } else if (response.data.status_code == 400) {

            this.setState({submitLoading: false});
            this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});

        }

    }

    async updateCannedMsg(){


        this.setState({submitLoading: true});
        let response = await (new Api()).call('PUT', API_URL + `/canned-messages/` + this.state.targetedCannedMsg.groupId, this.state.cannedMsgFormData, (new Token()).get());

        if (response.data.status_code == 200) {

            this.makeTableData(this.state.pageNumber);
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
    handleSearch = value =>
    {
        this.makeTableData('',value);
    }

    onHandleSelect = value => {
        this.makeTableData('',value);
    }

    componentDidMount() {
        this.makeTableData();

    }

    makeTableData(page = null, query = ''){
        let data=[];
        let helper = new Helper();
        let isEditPermitted = (new Auth).isPermitted('canned-message-edit');
        let isDeletePermitted = (new Auth).isPermitted('canned-message-delete');

        this.setState({dataTableSpinning: true});
        this.getCannedMessages(this.state.pageNumber).then((response) => {
            if (response.data.collections) {
                this.setState({serialCount: response.data.collections.from});
                response.data.collections.data.map((canned_message) => {

                    data.push({
                        id          : this.state.serialCount,
                        groupId     : canned_message.id,
                        title       : canned_message.title,
                        description : canned_message.description,
                        action      :<>
                                        <div>
                                            <ul className="list-inline m-0">
                                                <ActionButtons
                                                    viewActionProp  ={()=>this.viewAction(canned_message.id)}
                                                    editActionProp  ={()=>this.editAction(canned_message.id)}
                                                    deleteActionProp={()=>this.deleteAction(canned_message.id)}
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
                this.setState({pageCount: response.data.collections.last_page});
            }

            this.setState({cannedMessagesData: data});
            this.setState({dataTableSpinning: false});

        });

    }

    getModalView(){

        if (this.state.actionType != "view") {
            return <Form

                        onChangeHandler     ={this.onChangeHandler}
                        cannedMsgFormData       ={this.state.cannedMsgFormData}

                    />
        }else{
            return <View
                        targetedCannedMsg = {this.state.targetedCannedMsg}
                    />
        }
    }

    render() {
        let {locationPath} = this.state
        return (
            <Layout>

                <Modal
                    width="50%"
                    centered
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
                            onClick ={this.state.actionType == "edit" ? () => this.updateCannedMsg() : () => this.createNew()}
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
                        <span className={"ts-d-acc-name-text text-uppercase"}> Canned Message List</span>
                    </div>

                    <div className={"form-group m-0"}>
                        {
                            (new Auth).isPermitted('canned-message-create') ?
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
                            option={this.state.cannedMessagesData.map(({title})=>title)}
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
                            data={this.state.cannedMessagesData}
                            noDataComponent={<Spin size="midium" tip="Getting Data..." spinning={this.state.dataTableSpinning}></Spin>}
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

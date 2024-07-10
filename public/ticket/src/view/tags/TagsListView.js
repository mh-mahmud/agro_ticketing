import React, { Component } from 'react'

import AddActionButtons from '../../components/common/AddActionButton';
import BreadCrumbs from "../../components/common/BreadCrumbs";
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

export default class TagsListView extends Component {

    constructor(){
        super();
        this.state = {
             //breadcrumb
             locationPath                        : {
                base                            : 'Dashboard',
                basePath                        : '/',
                name                            : 'Tag List',
                path                            : 'tags',
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
            targetedTag         : '',
            tagFormData        : {
                name            : '',
                created_at      : '',
                updated_at	    : '',


            },
            columns : [
                {
                    name        : 'NO.',
                    selector    : row => row.id,
                    maxWidth    : "60px"
                },
                {
                    name        : 'Name',
                    selector    : row => row.name,
                },
                {
                    name        : 'Created At',
                    selector    : row => row.created_at,
                },
                {
                    name        : 'Updated At',
                    selector    : row => row.updated_at,
                },



                {
                    name        : 'Action',
                    selector    : row => row.action,
                    maxWidth    : "160px"
                }
            ],
            tagsData : []
        }

        this.createNew          = this.createNew.bind(this);
        this.updateTags        = this.updateTags.bind(this);
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


    async getTags_backup() {
        return await (new Api()).call('GET', API_URL + '/tags?page=' + this.state.pageNumber, [], (new Token()).get());
    }
    async getTags(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/tags?page=' + this.state.pageNumber, [], (new Token()).get(),this.params);
        } else{
            return await (new Api()).call('GET', API_URL + '/tags?page=' + this.state.pageNumber + '&query='+ query, [], (new Token()).get());
        }

    }

    viewAction(id){
        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'view'});
        this.setState({modalTitle : "Tag Details"});

        let targetedTag = this.state.tagsData.find(tag => tag.tagId === id);

        this.setState({targetedTag}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    editAction(id){

        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'edit'});
        this.setState({modalTitle : "Edit Tag"});

        let targetedTag = this.state.tagsData.find(tag => tag.tagId === id);
        let tagFormData    = {};
        // let selectedAgents  = [];

        for (var key in this.state.tagFormData) {
            tagFormData[key] = targetedTag[key] == null ? '' : targetedTag[key];
        }
        // targetedTag.agents.map((agent)=>{
        //     selectedAgents.push(agent.id.toString());
        // });
        // tagFormData.agents = selectedAgents;
        this.setState({targetedTag});
        this.setState({tagFormData: tagFormData});
        // this.setState({isModelViewReady:true});
        // this.setState({viewSpinning:false});
        this.setState({targetedTag}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    addAction(){

        this.setState({isModalVisible   : true});
        this.setState({modalTitle       : "Add New Tag"});
        this.setState({actionType       : "create"});

        let tagFormData = {};
        for (var key in this.state.tagFormData) {
            tagFormData[key] = '';
        }
        // this.setState({selectedAgents : []});
        this.setState({tagFormData}, ()=>{
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
                let response = await (new Api()).call('DELETE', API_URL + '/tags/' + id, [], (new Token()).get());
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


    resetModal() {
        this.setState({isModalVisible       : false});
        this.setState({submitLoading        : false});
        this.setState({isModelViewReady     : false});
        this.setState({viewSpinning         : false});
        this.setState({errors               : null});
    }

    // handleAgentsInput(value){
    //     let {tagFormData} = this.state;
    //     tagFormData.agents = value;
    //     this.setState({tagFormData: tagFormData});
    // }

    onChangeHandler = (event, key) => {
        const {tagFormData} = this.state;
        tagFormData[event.target.name] = event.target.value;
        this.setState({tagFormData});
    }

    async createNew(){

        this.setState({submitLoading: true});
        let response = await (new Api()).call('POST', API_URL + `/tags`, this.state.tagFormData, (new Token()).get());

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

    async updateTags(){


        this.setState({submitLoading: true});
        let response = await (new Api()).call('PUT', API_URL + `/tags/` + this.state.targetedTag.tagId, this.state.tagFormData, (new Token()).get());
        if (response.data.status_code == 200) {

            this.makeTableData(this.state.pageNumber);
            this.resetModal();
            message.success({
                content: 'Updated Successfully.',
                style: {
                    marginTop: ANTD_MESSAGE_MARGIN_TOP,
                }
            });

        } else if (response.data.status_code === 400) {

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
        let isEditPermitted = (new Auth).isPermitted('tag-edit');
        let isDeletePermitted = (new Auth).isPermitted('tag-delete');

        this.getTags(page,query).then((response) => {
            if (response.data.collections) {
                this.setState({serialCount: response.data.collections.from});
                response.data.collections.data.map((tag) => {

                    data.push({
                        id          : this.state.serialCount,
                        tagId     : tag.id,
                        name       : tag.name,
                        created_at      : tag.created_at,
                        updated_at      : tag.updated_at,


                        action      :<>
                                        <div>
                                            <ul className="list-inline m-0">
                                                <ActionButtons
                                                    viewActionProp  ={()=>this.viewAction(tag.id)}
                                                    editActionProp  ={()=>this.editAction(tag.id)}
                                                    deleteActionProp={()=>this.deleteAction(tag.id)}
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

            this.setState({tagsData: data});
            this.setState({dataTableSpinning: false});

        });

    }

    getModalView(){

        if (this.state.actionType != "view") {
            return <Form

                        onChangeHandler     ={this.onChangeHandler}
                        tagFormData       ={this.state.tagFormData}

                    />
        }else{
            return <View
                        targetedTag = {this.state.targetedTag}
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
                            onClick ={this.state.actionType == "edit" ? () => this.updateTags() : () => this.createNew()}
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
                        <span className={"ts-d-acc-name-text text-uppercase"}> Tag List</span>
                    </div>

                    <div className={"form-tag m-0"}>
                        {
                            (new Auth).isPermitted('tag-create') ?
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
                            option={this.state.tagsData.map(({name})=>name)}
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
                            data={this.state.tagsData}
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

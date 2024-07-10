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

export default class SourcesListView extends Component {

    constructor(){
        super();
        this.state = {
            //breadcrumb
            locationPath                        : {
                base                            : 'Dashboard',
                basePath                        : '/',
                name                            : 'Source List',
                path                            : 'sources',
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
            targetedSource      : '',
            sourceFormData        : {
                sourceId       : '',
                name            : '',
                parent_id       : 0,
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
                    name        : 'Created Time',
                    selector    : row => row.created_at,
                },
                {
                    name        : 'Updated Time',
                    selector    : row => row.updated_at,
                },
                {
                    name        : 'Action',
                    selector    : row => row.action,
                    maxWidth    : "160px"
                }
            ],
            sourcesData : []
        }

        this.createNew          = this.createNew.bind(this);
        this.updateSources      = this.updateSources.bind(this);
        this.handlePageClick    = this.handlePageClick.bind(this);
        // this.handleSelectOnChange    = this.handleSelectOnChange.bind(this);
    }

    handleCancel = () => {
        this.resetModal();
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData()
        });
    }

    async getSources(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/sources?page=' + this.state.pageNumber, [], (new Token()).get(),this.params);
        } else{
            return await (new Api()).call('GET', API_URL + '/sources?page=' + this.state.pageNumber + '&query='+ query, [], (new Token()).get());
        }

    }

    viewAction(id){
        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'view'});
        this.setState({modalTitle : "Source Details"});

        let targetedSource = this.state.sourcesData.find(source => source.sourceId === id);

        this.setState({targetedSource}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    editAction(id){

        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'edit'});
        this.setState({modalTitle : "Edit Source"});

        let targetedSource = this.state.sourcesData.find(source => source.sourceId === id);
        let sourceFormData    = {};
        // let selectedAgents  = [];

        for (var key in this.state.sourceFormData) {

            if (key === 'parent_id'){
                sourceFormData[key] = targetedSource[key] == null ? 0 : targetedSource[key];
            } else{
                sourceFormData[key] = targetedSource[key] == null ? '' : targetedSource[key];
            }
        }
        // targetedSource.agents.map((agent)=>{
        //     selectedAgents.push(agent.id.toString());
        // });
        // sourceFormData.agents = selectedAgents;
        this.setState({targetedSource});
        this.setState({sourceFormData: sourceFormData});
        // this.setState({isModelViewReady:true});
        // this.setState({viewSpinning:false});
        this.setState({targetedSource}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    addAction(){

        this.setState({isModalVisible   : true});
        this.setState({modalTitle       : "Add New Source"});
        this.setState({actionType       : "create"});

        let sourceFormData = {};
        for (var key in this.state.sourceFormData) {
            if (key === 'parent_id'){
                sourceFormData[key] = 0;
            } else{
                sourceFormData[key] = '';
            }
        }
        // this.setState({selectedAgents : []});
        this.setState({sourceFormData}, ()=>{
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
                let response = await (new Api()).call('DELETE', API_URL + '/sources/' + id, [], (new Token()).get());
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
    //     let {sourceFormData} = this.state;
    //     sourceFormData.agents = value;
    //     this.setState({sourceFormData: sourceFormData});
    // }

    onChangeHandler = (event, key) => {
        const {sourceFormData} = this.state;
        sourceFormData[event.target.name] = event.target.value;
        this.setState({sourceFormData});
    }

    handleSelectOnChange = (target, value) => {
        let {sourceFormData} = this.state;
        sourceFormData[target] = value;
        this.setState({sourceFormData},()=>{
            // console.log(this.state.sourceFormData)
        });
    }

    async createNew(){

        this.setState({submitLoading: true});
        let response = await (new Api()).call('POST', API_URL + `/sources`, this.state.sourceFormData, (new Token()).get());
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

    async updateSources(){


        this.setState({submitLoading: true});
        let response = await (new Api()).call('PUT', API_URL + `/sources/` + this.state.targetedSource.sourceId, this.state.sourceFormData, (new Token()).get());

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

    }

    makeTableData(page = null, query = ''){
        let data=[];
        let helper = new Helper();
        let isEditPermitted = (new Auth).isPermitted('source-edit');
        let isDeletePermitted = (new Auth).isPermitted('source-delete');

        // this.getSources(this.state.pageNumber).then((response) => {
        this.getSources(page,query).then((response) => {
            //alert(isDeletePermitted);
            if (response.data.collections) {
                this.setState({serialCount: response.data.collections.from});
                response.data.collections.data.map((source) => {

                    data.push({
                        id              : this.state.serialCount,
                        sourceId        : source.id,
                        name            : source.name,
                        parent_id       : source.parent_id,
                        created_at      : source.created_at,
                        updated_at      : source.updated_at,


                        action      :<>
                            <div>
                                <ul className="list-inline m-0">
                                    <ActionButtons
                                        viewActionProp  ={()=>this.viewAction(source.id)}
                                        editActionProp  ={()=>this.editAction(source.id)}
                                        deleteActionProp={()=>this.deleteAction(source.id)}
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

            this.setState({sourcesData: data});
            this.setState({dataTableSpinning: false});

        });

    }

    getModalView(){

        if (this.state.actionType != "view") {
            return <Form

                onChangeHandler         ={this.onChangeHandler}
                handleSelectOnChange    ={this.handleSelectOnChange}
                sourceFormData          ={this.state.sourceFormData}

            />
        }else{
            return <View
                targetedSource = {this.state.targetedSource}
                sources = {this.state.sourcesData}
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
                            onClick ={this.state.actionType == "edit" ? () => this.updateSources() : () => this.createNew()}
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
                        <span className={"ts-d-acc-name-text text-uppercase"}> Source List</span>
                    </div>

                    <div className={"form-group m-0"}>
                        {
                            (new Auth).isPermitted('source-create') ?
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
                            option={this.state.sourcesData.map(({name})=>name)}
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
                            data={this.state.sourcesData}
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

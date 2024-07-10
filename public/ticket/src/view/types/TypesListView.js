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

export default class TypesListView extends Component {

    constructor(){
        super();
        this.state = {
             //breadcrumb
             locationPath                        : {
                base                            : 'Dashboard',
                basePath                        : '/',
                name                            : 'Category List',
                path                            : 'types',
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
            targetedType        : '',
            typeFormData        : {
                name            : '',
                description     : '',
                day             : 0,
                hour            : 0,
                min             : 0,
                // time            : 0,
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
            typesData : []
        }

        this.createNew          = this.createNew.bind(this);
        this.updateTypes        = this.updateTypes.bind(this);
        this.handlePageClick    = this.handlePageClick.bind(this);
        // this.onNumberChangeHandler    = this.onNumberChangeHandler.bind(this);
    }

    handleCancel = () => {
        this.resetModal();
    }

    handlePageClick(item) {
        this.setState({pageNumber: (item.selected + 1)}, () => {
            this.makeTableData()
        });
    }

    async getTypes(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/types?page=' + this.state.pageNumber, [], (new Token()).get(),this.params);
        } else{
            return await (new Api()).call('GET', API_URL + '/types?page=' + this.state.pageNumber + '&query='+ query, [], (new Token()).get());
        }

    }

    viewAction(id){
        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'view'});
        this.setState({modalTitle : "Type Details"});

        let targetedType = this.state.typesData.find(type => type.groupId === id);

        this.setState({targetedType}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    editAction(id){

        this.setState({viewSpinning:true});
        this.setState({isModalVisible:true});
        this.setState({actionType: 'edit'});
        this.setState({modalTitle : "Edit"});

        let targetedType = this.state.typesData.find(type => type.groupId === id);
        let typeFormData    = {};
        // let selectedAgents  = [];

        for (var key in this.state.typeFormData) {
            if (key === 'day' || key==='hour' || key ==='min'){
                typeFormData[key] = targetedType[key] == null ? 0 : targetedType[key];
            }else{
                typeFormData[key] = targetedType[key] == null ? '' : targetedType[key];
            }
            // typeFormData[key] = targetedType[key] == null ? '' : targetedType[key];
        }
        this.setState({targetedType});
        this.setState({typeFormData: typeFormData},()=>{
            console.log(this.state.typeFormData)
        });
        this.setState({targetedType}, ()=>{
            this.setState({isModelViewReady:true});
            this.setState({viewSpinning:false});
        });

    }

    addAction(){

        this.setState({isModalVisible   : true});
        this.setState({modalTitle       : "Add New Category"});
        this.setState({actionType       : "create"});

        let typeFormData = {};
        for (var key in this.state.typeFormData) {
            if (key === 'day' || key==='hour' || key ==='min'){
                typeFormData[key] = 0;
            }else{
                typeFormData[key] = '';
            }
        }
        // this.setState({selectedAgents : []});
        this.setState({typeFormData}, ()=>{
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
                let response = await (new Api()).call('DELETE', API_URL + '/types/' + id, [], (new Token()).get());
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

    onChangeHandler = (event, key) => {
        const {typeFormData} = this.state;
        typeFormData[event.target.name] = event.target.value;
        this.setState({typeFormData},()=>{
            console.log(this.state.typeFormData)
        });
    }



    async createNew(){

        // let {typeFormData} = this.state;
        // typeFormData.time = Number(typeFormData.day*8) + Number(typeFormData.hour) + Number(typeFormData.min/60);
        // this.setState({typeFormData},()=>{
        //     console.log(this.state.typeFormData.time)
        // })

        this.setState({submitLoading: true});
        let response = await (new Api()).call('POST', API_URL + `/types`, this.state.typeFormData, (new Token()).get());
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

    async updateTypes(){


        this.setState({submitLoading: true});
        let response = await (new Api()).call('PUT', API_URL + `/types/` + this.state.targetedType.groupId, this.state.typeFormData, (new Token()).get());

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
        let isEditPermitted = (new Auth).isPermitted('type-edit');
        let isDeletePermitted = (new Auth).isPermitted('type-delete');

        this.getTypes(page,query).then((response) => {
            //alert(isDeletePermitted);
            if (response.data.collections) {
                this.setState({serialCount: response.data.collections.from});
                response.data.collections.data.map((type) => {

                    data.push({
                        id                  : this.state.serialCount,
                        groupId             : type.id,
                        name                : type.name,
                        description         : type.description,
                        // time                : type.time,
                        day                 : type.day,
                        hour                : type.hour,
                        min                 : type.min,
                        created_at          : type.created_at,
                        updated_at          : type.updated_at,
                        action              :<>
                                                <div>
                                                    <ul className="list-inline m-0">
                                                        <ActionButtons
                                                            viewActionProp  ={()=>this.viewAction(type.id)}
                                                            editActionProp  ={()=>this.editAction(type.id)}
                                                            deleteActionProp={()=>this.deleteAction(type.id)}
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

            this.setState({typesData: data});
            this.setState({dataTableSpinning: false});

        });

    }

    getModalView(){

        if (this.state.actionType != "view") {
            return <Form

                        onChangeHandler     ={this.onChangeHandler}
                        typeFormData       ={this.state.typeFormData}

                    />
        }else{
            return <View
                        targetedType = {this.state.targetedType}
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
                            onClick ={this.state.actionType == "edit" ? () => this.updateTypes() : () => this.createNew()}
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
                        <span className={"ts-d-acc-name-text text-uppercase"}> Type List</span>
                    </div>

                    <div className={"form-group m-0"}>
                        {
                            (new Auth).isPermitted('type-create') ?
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
                            option={this.state.typesData.map(({name})=>name)}
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
                            data={this.state.typesData}
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

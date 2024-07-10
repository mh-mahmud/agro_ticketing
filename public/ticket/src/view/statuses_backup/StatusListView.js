import React from 'react';
import Api from '../../services/Api';
import DataTable from 'react-data-table-component';
import {API_URL} from "../../Config";
import Token from '../../services/Token';
import Pagination from '../../components/Pagination/Pagination';
import ActionButtons from '../../components/common/ActionButtons';
import AddActionButtons from '../../components/common/AddActionButton';
import { Modal, Button, AutoComplete, Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import {NavLink} from "react-router-dom";

export default class StatusListView extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            pageCount               : 0,
            serialCount             : 1,
            isViewModalVisible      : false,
            isSpecifyModalOperation : '',
            viewSpinning            : false,
            isLoading               : false,
            viewModalTitle          : '',
            confirmViewLoading      : false,
            isViewTableReady        : false,
            viewInfo                : {
                id                  : '',
                name                : '',
                slug                : '',
                created_at          : '',
                updated_at          : ''
            },
            columns                 : [
                {
                    name            : 'NO.',
                    selector        : row => row.id,
                    maxWidth        : "60px"
                },
                {
                    name            : 'Name',
                    selector        : row => row.name,
                },
                {
                    name            : 'Created Time',
                    selector        : row => row.created_at,
                },
                {
                    name            : 'Updated Time',
                    selector        : row => row.updated_at,
                },
                {
                    name            : 'Action',
                    selector        : row => row.action,
                }
            ],
            data                    : []
        };
        this.handlePageClick        = this.handlePageClick.bind(this);
    }

    //api call methods start
    async getAll(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/statuses?page=' + page, [], (new Token()).get(),this.params);
        } else{
            return await (new Api()).call('GET', API_URL + '/statuses?page=' + page + '&query='+ query, [], (new Token()).get());
        }

    }

    async getAdd(){
        return await (new Api()).call('POST', API_URL + '/statuses', this.state.viewInfo, (new Token()).get());
    }

    async getUpdate(){
        return await (new Api()).call('PUT', API_URL + `/statuses/${this.state.viewInfo.id}`, this.state.viewInfo, (new Token()).get());
    }

    async getDelete(){
        return await (new Api()).call('DELETE', API_URL + `/statuses/${this.state.viewInfo.id}`, [], (new Token()).get());
    }
    //api call methods end

    // changing value start
    handleChange (e) {
        const name = e.target.value;
        this.setState({viewInfo : { id : this.state.viewInfo.id, name : name}});
    }
    // changing value end

    //handle search start
    handleSearch = value =>
    {
        this.makeTableData('',value);
    }

    onHandleSelect = value => {
        this.makeTableData('',value);
    }
    //handle search end

    componentDidMount(){
        this.makeTableData();
    }

    // operational work start
    addAction(){
        this.setState({viewSpinning:true});
        this.setState({viewModalTitle:"Add Status"});
        this.setState({isViewModalVisible:true});
        this.setState({viewInfo:{id: '',name:'',slug :'',created_at :'',updated_at:''}});
        this.setState({viewSpinning:false});
        this.setState({isViewTableReady:true});
        this.setState({isSpecifyModalOperation:'insert'});
    }

    viewAction(item){
        this.setState({viewSpinning:true});
        this.setState({viewModalTitle:"Status Details"});
        this.setState({isViewModalVisible:true});
        this.setState({viewInfo:item});
        this.setState({viewSpinning:false});
        this.setState({isViewTableReady:true});
        this.setState({isSpecifyModalOperation:'view'});
    }

    editAction(item){
        this.setState({viewSpinning:true});
        this.setState({viewModalTitle:"Status Details"});
        this.setState({isViewModalVisible:true});
        this.setState({viewInfo:item});
        this.setState({viewSpinning:false});
        this.setState({isViewTableReady:true});
        this.setState({isSpecifyModalOperation:'edit'});
    }

    deleteAction(item){
        this.setState({viewSpinning:true});
        this.setState({viewModalTitle:"Status Details"});
        this.setState({isViewModalVisible:true});
        this.setState({viewInfo:item});
        this.setState({viewSpinning:false});
        this.setState({isViewTableReady:true});
        this.setState({isSpecifyModalOperation:'delete'});
    }
    // operational work end

    //operational work view start
    getOperationalView(info,operation){
        if (operation == 'view'){
            return (
                <>
                    <table>
                        <tbody>
                        <tr>
                            <th>Name</th>
                            <td>:</td>
                            <td>
                                {info.name}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </>
            )
        } else if(operation == 'edit'){
            return (
                <>
                    <table>
                        <tbody>
                        <tr>
                            <th>Name</th>
                            <td>:</td>
                            <td>
                                <input hidden type="text" className={"form-control"} value={info.id}/>
                                <input type="text" className={"form-control"} value={info.name} onChange={(e) => {this.handleChange(e)}}/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </>
            );
        }else if(operation == 'insert'){
            return (
                <>
                    <table>
                        <tbody>
                        <tr>
                            <th>Name</th>
                            <td>:</td>
                            <td>
                                <input type="text" className={"form-control"} placeholder={"Write here"} value={info.name} onChange={(e) => {this.handleChange(e)}}/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </>
            );
        }else{
            return (
                <>
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <input hidden type="text" className={"form-control"} value={info.id}/>
                                <span><b className="text-danger">{info.name}</b>, Are you want to delete this?</span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </>
            )
        }
    }
    //operational work view end

    //setting data to table start
    makeTableData(page = null, query = ''){
        let data=[];
        this.getAll(page,query).then((response) =>
        {
            if(response.data.collections){
                this.setState({serialCount:response.data.collections.from});
                response.data.collections.data.map((collection)=>{
                    data.push({
                        id              : this.state.serialCount,
                        name            : collection.name,
                        created_at      : collection.created_at,
                        updated_at      : collection.updated_at,
                        action          :<>
                                            <div>
                                                <ul className="list-inline m-0">
                                                    <ActionButtons
                                                        viewActionProp={()=>this.viewAction(collection)}
                                                        editActionProp={()=>this.editAction(collection)}
                                                        deleteActionProp={()=>this.deleteAction(collection)}
                                                    />
                                                </ul>
                                            </div>
                                        </>
                    });
                    this.setState({serialCount:(this.state.serialCount +1)});
                    return 1;
                });
                this.setState({pageCount:response.data.collections.last_page});
            }

            this.setState({data:data});

        });

    }

    handlePageClick(item){
        this.makeTableData(item.selected + 1);
    }
    //setting data to table end

    /* Modal Methods */
    handleOk(status) {
        let _that = this;
        this.setState({isLoading: true });
        if (status === 'insert'){
            this.getAdd().then(function (response) {
                if (response.data.status_code === 201){
                    _that.makeTableData();
                    _that.resetModal();
                }
            });
        } else if (status === 'edit'){
            this.getUpdate().then(function (response) {
                if (response.data.status_code === 200){
                    _that.makeTableData();
                    _that.resetModal();
                }
            });
        }else {
            this.getDelete().then(function (response) {
                if (response.data.status_code === 200){
                    _that.makeTableData();
                    _that.resetModal();
                }
            });
        }
    }

    handleCancel = () => {
        this.resetModal();
    }

    resetModal(){
        this.setState({viewInfo:{id: '',name:'',slug :'',created_at :'',updated_at:''}});
        this.setState({isViewModalVisible:false});
        this.setState({viewSpinning:false});
        this.setState({isViewTableReady:false});
        this.setState({isLoading:false});
    }
    /* End Modal Methods */

    render() {
        return (
            <>
                <Modal
                    width="75%"
                    zIndex="1050"
                    title={this.state.viewModalTitle}
                    visible={this.state.isViewModalVisible}
                    confirmLoading={this.state.confirmViewLoading}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                            Close
                        </Button>,
                        <Button className={ this.state.isSpecifyModalOperation != "edit" ? "d-none" : ""} loading={this.state.isLoading} key="Update" type="primary" onClick={(e)=>this.handleOk(this.state.isSpecifyModalOperation)}>
                            Submit
                        </Button>,
                        <Button className={ this.state.isSpecifyModalOperation != "delete" ? "d-none" : ""} loading={this.state.isLoading} key="Delete" type="danger" onClick={(e)=>this.handleOk(this.state.isSpecifyModalOperation)}>
                            Delete
                        </Button>,
                        <Button className={ this.state.isSpecifyModalOperation != "insert" ? "d-none" : ""} loading={this.state.isLoading} key="Add" type="primary" onClick={(e)=>this.handleOk(this.state.isSpecifyModalOperation)}>
                            Submit
                        </Button>,
                    ]}>
                    <div className={"spinner-centered mt-2"}>
                        {this.state.isViewTableReady ? this.getOperationalView(this.state.viewInfo,this.state.isSpecifyModalOperation) : ''}
                    </div>
                </Modal>

                <div className={"ts-d-top-header mb-4"}>
                    <div className={"ts-d-acc-name"}>
                        <span className={"bi bi-list"}/>
                        <span className={"ts-d-acc-name-text text-uppercase"}> Status List</span>
                    </div>

                    <div className={"form-group m-0"}>
                        <AddActionButtons addActionProp={() => this.addAction()}/>
                    </div>

                </div>

                {/*Sub Menu Area*/}
                <div className="container-fluid">
                    {/*Submenu Area*/}
                    <div className="ts-d-submenu-area">
                        <div className="ts-d-left-toolbar ts-d-top-toolbar">
                            <ul>
                                <li>
                                    <a href="">
                                        <i className="bi bi-house-door"></i> Home
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i className="bi bi-ui-checks"></i> My Job
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i className="bi bi-file-lock"></i> Change Password
                                    </a>
                                </li>
                            </ul>
                        </div>


                        {/*<div className="ts-d-right-toolbar ts-d-top-toolbar">*/}
                        {/*    <ul>*/}
                        {/*        <li>*/}
                        {/*            <NavLink to="/open-ticket">*/}
                        {/*                <i className="bi bi-folder2-open"></i> Opened Ticket*/}
                        {/*            </NavLink>*/}
                        {/*        </li>*/}
                        {/*        <li>*/}
                        {/*            <NavLink to="/close-ticket">*/}
                        {/*                <i className="bi bi-folder-x"></i> Close Ticket*/}
                        {/*            </NavLink>*/}
                        {/*        </li>*/}
                        {/*    </ul>*/}
                        {/*</div>*/}
                    </div>
                    {/*End Submenu Area*/}
                </div>


                {/*Search Components*/}
                <div className="container-fluid p-0 mb-4">
                    <div className="ts-d-search-area mx-0">
                        <AutoComplete
                            style={{width: '100%',}}
                            option={this.state.data.map(({name}) => name)}
                            placeholder="Search your item...."
                            onSelect={this.onHandleSelect}
                            onSearch={this.handleSearch}
                            filterOption={(inputValue, option) =>
                                option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                            }
                        >
                            <Input suffix={<SearchOutlined type="search"/>}/>
                        </AutoComplete>
                    </div>
                </div>


                <div className="container-fluid">

                    <div className={"ts-d-common-list-view"}>
                        <DataTable
                            columns={this.state.columns}
                            data={this.state.data}
                            noDataComponent={<Spin size="midium" tip="Getting Data..."
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

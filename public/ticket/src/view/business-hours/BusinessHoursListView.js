import React from 'react'
import Layout from "../../components/common/Layout";
import BreadCrumbs from "../../components/common/BreadCrumbs";
import AddActionButtons from "../../components/common/AddActionButton";
import DataTable from "react-data-table-component";
import {
    Alert,
    AutoComplete,
    Button,
    Divider,
    Input,
    message,
    Modal,
    Radio,
    Select,
    Spin,
    Switch,
    TimePicker
} from "antd";
import Pagination from "../../components/Pagination/Pagination";
import ActionButtons from "../../components/common/ActionButtons";
import Api from "../../services/Api";
import {ANTD_MESSAGE_MARGIN_TOP, API_URL} from "../../Config";
import Token from "../../services/Token";
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import Joi from 'joi';
import Auth from '../../services/Auth';
import moment from 'moment';
import Helper from "../../services/Helper";

const { confirm }   = Modal;
const { Option }    = Select;

const format = 'HH:mm';

export default class BusinessHoursListView extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            //breadcrumb
            locationPath                        : {
                base                            : 'Dashboard',
                basePath                        : '/',
                name                            : 'Business Hour List',
                path                            : 'business-hours',
            },
            //table
            data                                : [],
            viewInfo                            : {
                id                              : '',
                name                            : '',
                description                     : '',
                holi_day_id                     : '',
                time_zone_id                    : '',
                status                          : '',
                created_at                      : '',
                updated_at                      : '',
                time_slots                      : '',
            },
            validationError     : {
                sl                              : '',
                slug                            : '',
                id                              : '',
                name                            : '',
                description                     : '',
                holi_day_id                     : '',
                time_zone_id                    : '',
                status                          : '',
                created_at                      : '',
                updated_at                      : '',
                time_slots                      : '',
                action                          : ''
            },
            errors                              : null,
            timezones                           : [],
            columns                             : [
                {
                    name                        : 'NO.',
                    selector                    : row => row.sl,
                    maxWidth                    : "60px"
                },
                {
                    name                        : 'Name',
                    selector                    : row => row.name,
                },
                {
                    name                        : 'Action',
                    selector                    : row => row.action,
                }
            ],
            pageCount                           : 0,
            serialCount                         : 1,
            //modal
            viewModalTitle                      : '',
            isSpecifyModalOperation             : '',
            isViewModalVisible                  : false,
            confirmViewLoading                  : false,
            isViewTableReady                    : false,
            dataTableSpinning                   : true,
            viewSpinning                        : false,
            isButtonLoading                     : false,
            time_slot_type                      : 'C',
            weekday                             : [
                                                    {name : 'SUN', checked : false, start_time : '00:00', end_time: '23:59'},
                                                    {name : 'MON', checked : false, start_time : '00:00', end_time: '23:59'},
                                                    {name : 'TUE', checked : false, start_time : '00:00', end_time: '23:59'},
                                                    {name : 'WED', checked : false, start_time : '00:00', end_time: '23:59'},
                                                    {name : 'THU', checked : false, start_time : '00:00', end_time: '23:59'},
                                                    {name : 'FRI', checked : false, start_time : '00:00', end_time: '23:59'},
                                                    {name : 'SAT', checked : false, start_time : '00:00', end_time: '23:59'},
                                                  ],
            isCreatePermitted                   : ''
        }

        this.handlePageClick        = this.handlePageClick.bind(this);
    }

    handlePageClick(item){
        this.makeTableData(item.selected + 1);
    }

    componentDidMount() {
        this.makeTableDataTimzones();
        this.makeTableData()
        let {isCreatePermitted} =  this.state;
        isCreatePermitted = (new Auth).isPermitted('business-hour-create');
        this.setState({isCreatePermitted});
    }

    async getTimezones(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/timezones?page=' + page, [], (new Token()).get());
        } else{
            return await (new Api()).call('GET', API_URL + '/timezones?page=' + page + '&query='+ query, [], (new Token()).get());
        }

    }

    async getAll(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/business-hours?page=' + page, [], (new Token()).get());
        } else{
            return await (new Api()).call('GET', API_URL + '/business-hours?page=' + page + '&query='+ query, [], (new Token()).get());
        }

    }

    async get(id){
        return await (new Api()).call('GET', API_URL + '/business-hours/' + id, [], (new Token()).get());
    }

    makeTableData(page = null, query = ''){
        let data=[];
        let isEditPermitted = (new Auth).isPermitted('business-hour-edit');
        let isDeletePermitted = (new Auth).isPermitted('business-hour-delete');
        this.getAll(page,query).then((response) =>
        {
            if(response.data.collections){
                this.setState({serialCount:response.data.collections.from});
                response.data.collections.data.map(({id,name,slug,description,time_zone_id,holi_day_id,status,time_slots,created_at,updated_at})=>{
                    data.push({
                        sl              : this.state.serialCount,
                        id              : id,
                        name            : name,
                        slug            : slug,
                        description     : description,
                        time_zone_id    : time_zone_id,
                        holi_day_id     : holi_day_id,
                        time_slots      : time_slots,
                        created_at      : created_at,
                        updated_at      : updated_at,
                        status          : status,
                        action          :<>
                                            <div>
                                                <ul className="list-inline m-0">
                                                    <ActionButtons
                                                        viewActionProp={()=>this.viewAction(id)}
                                                        editActionProp={()=>this.editAction(id)}
                                                        deleteActionProp={()=>this.deleteAction(id)}
                                                        isEditPermitted={isEditPermitted}
                                                        isDeletePermitted={false}
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
            this.setState({dataTableSpinning: false});
        });
    }

    makeTableDataTimzones(page = null, query = ''){
        let listing = [];
        this.getTimezones(page,query).then((response) =>
        {
            if (response.data.status === 200){
                response.data.collections.forEach(item =>{
                    listing.push({
                        id              : item.id,
                        timezone        : item.timezone,
                        code            : item.code,
                        utc_offset      : item.utc_offset,
                        utc_dst_offset  : item.utc_dst_offset
                    });
                })
                this.setState({timezones : listing})
            }
        });

    }

    addAction(){
        this.setState({isViewModalVisible       : true})
        this.setState({viewModalTitle           : 'Business Hour Details Create'})
        this.setState({isViewTableReady         : false})
        this.setState({viewSpinning             : false})
        this.setState({isSpecifyModalOperation  : 'insert'})
        let viewInfo = {
            id                          : '',
            name                        : '',
            holi_day_id                 : '',
            description                 : '',
            time_zone_id                : '',
            status                      : '',
            created_at                  : '',
            updated_at                  : '',
            time_slots                  : []
        };

        for (var key in viewInfo) {
            if (key === 'time_zone_id'){
                viewInfo[key] = 254;
            }
            else if (key === 'status'){
                viewInfo[key] = 0;
            }
            else{
                viewInfo[key] = '';
            }
        }

        this.setState({viewInfo},()=>{
            this.setState({isViewTableReady         : true})
            this.setState({viewSpinning             : true})
        });
    }

    editAction(id){
        this.setState({isViewModalVisible       : true})
        this.setState({viewModalTitle           : 'Business Hour Details Update'})
        this.setState({isViewTableReady         : false})
        this.setState({viewSpinning             : false})
        this.setState({isSpecifyModalOperation  : 'update'})
        let viewInfo = {
            id                          : '',
            name                        : '',
            holi_day_id                 : '',
            time_zone_id                : '',
            description                 : '',
            status                      : '',
            created_at                  : '',
            updated_at                  : '',
            time_slots                  : []
        };

        let businessHour = this.state.data.find((collection) => collection.id === id);
        for (var key in businessHour) {
            viewInfo[key] = businessHour[key];
        }

        let {time_slot_type} = this.state
        let {weekday} = this.state

        if (viewInfo.time_slots === 7){
            time_slot_type = 'F';

            viewInfo.time_slots.forEach(val =>{
                weekday.forEach((item, key)=>{
                    if (item.name == val.day){
                        item.checked = true;
                        item.start_time = val.start_time;
                        item.end_time = val.end_time;
                    }
                })
            })
            this.setState({weekday},()=>{
                // console.log(this.state.weekday)
            })
            this.setState({time_slot_type})
        } else{
            time_slot_type = 'C'
            viewInfo.time_slots.forEach(val =>{
                // console.log(val);
                weekday.forEach((item, key)=>{
                    // console.log(item)
                    if (item.name == val.day){
                        item.checked = true;
                        item.start_time = val.start_time;
                        item.end_time = val.end_time;
                    }
                })
            })

            this.setState({weekday},()=>{
                // console.log(this.state.weekday)
            })

            this.setState({time_slot_type})
        }


        this.setState({viewInfo},()=>{
            this.setState({isViewTableReady         : true})
            this.setState({viewSpinning             : true})
        });
    }

    viewAction(id){
        this.setState({isViewModalVisible       : true})
        this.setState({viewModalTitle           : 'Business Hour Details'})
        this.setState({isViewTableReady         : false})
        this.setState({viewSpinning             : false})
        this.setState({isSpecifyModalOperation  : 'view'})
        let viewInfo = {
            id                          : '',
            name                        : '',
            holi_day_id                 : '',
            time_zone_id                : '',
            description                 : '',
            status                      : '',
            created_at                  : '',
            updated_at                  : '',
            time_slots                  : []
        };

        let businessHour = this.state.data.find((collection) => collection.id === id);
        for (var key in businessHour) {
            viewInfo[key] = businessHour[key];
        }


        this.setState({viewInfo},()=>{
            this.setState({isViewTableReady         : true})
            this.setState({viewSpinning             : true})
        });
    }

    deleteAction(id){
        confirm({
            title: 'Are you sure delete this business hour?',
            icon: <ExclamationCircleOutlined />,
            // content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk : async ()=>{
                let response = await (new Api()).call('DELETE', API_URL + '/business-hours/' + id, [], (new Token()).get());;
                if (response.data.status_code == 200) {
                    this.makeTableData();
                    this.resetModal();
                    message.success({
                        content: 'Deleted business hour successfully.',
                        style: {
                            marginTop: ANTD_MESSAGE_MARGIN_TOP,
                        }
                    });
                }
                else if (response.data.status == 400) {
                    this.setState({isButtonLoading  : true});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
                }
            }
        });
    }

    resetModal(){
        this.setState({isViewModalVisible       : false})
        this.setState({viewModalTitle           : ''})
        this.setState({isViewTableReady         : true})
        this.setState({viewSpinning             : true})
        this.setState({isSpecifyModalOperation  : ''})
        this.setState({time_slot_type           : 'C'})
        this.setState({errors                   : null});
        this.setState({isButtonLoading          : false});

        let viewInfo = {
            id                          : '',
            name                        : '',
            holi_day_id                 : '',
            description                 : '',
            time_zone_id                : '',
            status                      : '',
            created_at                  : '',
            updated_at                  : '',
            time_slots                 : []
        };

        let weekday = [
            {name : 'SUN', checked : false, start_time : '00:00', end_time: '23:59'},
            {name : 'MON', checked : false, start_time : '00:00', end_time: '23:59'},
            {name : 'TUES', checked : false, start_time : '00:00', end_time: '23:59'},
            {name : 'WED', checked : false, start_time : '00:00', end_time: '23:59'},
            {name : 'THURS', checked : false, start_time : '00:00', end_time: '23:59'},
            {name : 'FRI', checked : false, start_time : '00:00', end_time: '23:59'},
            {name : 'SAT', checked : false, start_time : '00:00', end_time: '23:59'},
        ]

        for (var key in viewInfo) {
            viewInfo[key] = '';
        }
        this.setState({viewInfo},()=>{
            this.setState({isViewTableReady         : false})
            this.setState({viewSpinning             : false})
            this.setState({weekday})
        })
    }

    validateViewInfoData(){
        let rules = {
            name                            : Joi.string().min(3).label('Business Hour Name').required(),
            time_zone_id                    : Joi.number().required(),
            holi_day_id                     : Joi.any(),
            description                     : Joi.any(),
            status                          : Joi.any(),
            created_at                      : Joi.any(),
            updated_at                      : Joi.any(),
            time_slots                      : Joi.any(),
            id                              : Joi.any(),
            sl                              : Joi.any(),
            slug                            : Joi.any(),
            action                          : Joi.any()
           }
        return Joi.object( rules );
    }

    async createBusinessHour(){
        let {viewInfo} = this.state
        let {weekday} = this.state

        const result = weekday.filter(({checked}) => checked === true);
        viewInfo.time_slots = JSON.stringify(result);

        this.setState({isButtonLoading  : true});
        this.setState({errors           : null});

        let schema = this.validateViewInfoData();

        try {
            const data     = await schema.validateAsync(viewInfo);
            let response    = await (new Api()).call('POST', API_URL + '/business-hours/', data, (new Token()).get());
            if (response.data.status_code == 201) {
                this.setState({isButtonLoading : false});
                this.makeTableData(this.state.pageNumber);
                this.resetModal();
                message.success({
                    content: 'Created Successfully.',
                    style: {
                        marginTop: ANTD_MESSAGE_MARGIN_TOP,
                    }
                });
            } else if (response.data.status == 400 || response.data.status_code == 424) {
                this.setState({isButtonLoading  : false});
                this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
            }

        }catch (err) {
            const {validationError} = this.state;
            this.setState({isButtonLoading: false});
            // console.log(err)
            validationError[err.details[0].context.key] = err.details[0].message;
            this.setState({ validationError: validationError });
            validationError[err.details[0].context.key] ='';
        }
    }

    async updateBusinessHour(){
        let {viewInfo} = this.state
        let {weekday} = this.state

        const result = weekday.filter(({checked}) => checked === true);
        viewInfo.time_slots = JSON.stringify(result);

        this.setState({errors           : null});
        this.setState({isButtonLoading  : true});

        let schema = this.validateViewInfoData();


        try {
            const data = await schema.validateAsync(viewInfo);

            let response = await (new Api()).call('PUT', API_URL + '/business-hours/' + data.id, viewInfo, (new Token()).get());
            if (response.data.status_code == 200) {
                this.setState({isButtonLoading : false});
                this.makeTableData(this.state.pageNumber);
                this.resetModal();
                message.success({
                    content: 'Updated Successfully.',
                    style: {
                        marginTop: ANTD_MESSAGE_MARGIN_TOP,
                    }
                });
            } else if (response.data.status == 400 || response.data.status_code == 424) {
                this.setState({isButtonLoading: false});
                this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
            }

        }catch (err) {
            const {validationError} = this.state;
            this.setState({isButtonLoading: false});
            validationError[err.details[0].context.key] = err.details[0].message;
            this.setState({ validationError: validationError });
            validationError[err.details[0].context.key] ='';
        }
    }

    //modal functional
    handleCancel = () => {
        this.resetModal();
    }

    //event
    onChangeHandler = (e, key) => {
        const { viewInfo } = this.state;
        viewInfo[e.target.name] = e.target.value;
        this.setState({ viewInfo });
    }

    onSectChangeHandler =(value)=> {
        let { viewInfo } = this.state;
        if( value === undefined || value.length == 0 ){
            value = '';
        }
        viewInfo.time_zone_id = value;
        this.setState({viewInfo});
        // console.log(value);
    }

    statusOnChange =(checked, event)=>{
        let {viewInfo}  = this.state;
        viewInfo.status = checked ? 1 : 0;
        this.setState({viewInfo});
    }

    onRadioChangeHandler = (e)=>{
        let {time_slot_type}  = this.state;
        time_slot_type = e.target.value;


        let {weekday}  = this.state;
        if (time_slot_type === 'F'){
            weekday.forEach((item)=>{
                item.checked = true;
            })
        }else{
            weekday.forEach((item)=>{
                item.checked = false;
            })
        }

        this.setState({time_slot_type},()=>{
            this.setState({weekday}); //weekday object set
            // console.log(time_slot_type)
            // console.log(weekday)
        }); //slot type set


    }

    getCustomDaySlot = (e,key)=>{
        e.preventDefault();
        let {weekday} = this.state;
        weekday[key].checked = !weekday[key].checked;
        this.setState({weekday},()=>{
            // console.log(weekday);
        })
    }

    //handle search start
    handleSearch = value =>
    {
        setTimeout(()=>{
            this.makeTableData('',value);
        },500)
    }

    onHandleSelect = value => {
        this.makeTableData('',value);
    }
    //handle search end


    render() {
        const {timezones} = this.state;
        let slectedTimezone = timezones.find(el => el.id === this.state.viewInfo.time_zone_id)
        let {weekday,time_slot_type,isButtonLoading,viewInfo, viewModalTitle,isViewModalVisible,isSpecifyModalOperation,confirmViewLoading,locationPath,columns,data,dataTableSpinning,pageCount,isViewTableReady} = this.state
        return(
            <React.Fragment>
                <Layout>
                    <div className={"ts-d-top-header mb-4"}>
                        <div className={"ts-d-acc-name"}>
                            <span className={"bi bi-list"}/>
                            <span className={"ts-d-acc-name-text text-uppercase"}> Business Hours List</span>
                        </div>

                        {/* <div className={"form-group m-0"}>
                        {
                            (new Auth).isPermitted('business-hour-create') ?
                            <AddActionButtons addActionProp={()=>this.addAction()}/>
                            : null
                        }
                        </div> */}
                    </div>

                    <BreadCrumbs locationPath={locationPath}/>

                    {/* <div className="container-fluid p-0 mb-4">
                        <div className="ts-d-search-area mx-0">
                            <AutoComplete
                                style={{ width: '100%',}}
                                option={this.state.data.map(({name})=>name)}
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
                    </div> */}

                    <div className="container-fluid">
                        <div className={"ts-d-common-list-view"}>
                            <DataTable
                                columns={columns}
                                data={data}
                                noDataComponent={<Spin size="midium"  tip="Getting Data..." spinning={dataTableSpinning}></Spin>}
                                striped={true}
                                highlightOnHover={true}
                            />
                        </div>
                    </div>
                    {/* <Pagination pageCount={pageCount} handlePageClick={this.handlePageClick}/> */}

                    <Modal
                        width="75%"
                        centered
                        zIndex="1050"
                        title={viewModalTitle}
                        visible={isViewModalVisible}
                        confirmLoading={confirmViewLoading}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        footer={[
                            <Button key="back" onClick={this.handleCancel}>
                                Close
                            </Button>,
                            <Button
                                className={ isSpecifyModalOperation != "update" ? "d-none" : ""}
                                loading={isButtonLoading}
                                key="Update"
                                type="primary"
                                onClick={() => this.updateBusinessHour()}
                            >
                                Submit
                            </Button>,
                            <Button
                                className={ isSpecifyModalOperation != "insert" ? "d-none" : ""}
                                loading={isButtonLoading}
                                key="Insert"
                                type="primary"
                                onClick={() => this.createBusinessHour()}
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

                        <div className={"spinner-centered mt-2"}>
                            {isViewTableReady && isSpecifyModalOperation === 'view' ?
                                <div className="ts-d-u-profile-preview-card">

                                    <div className="ts-d-u-profile-single-row-area">
                                        <div className="ts-d-u-profile-single-row">
                                            <span>Name</span>
                                            <span>{viewInfo.name}</span>
                                        </div>

                                        <div className="ts-d-u-profile-single-row">
                                            <span>Description</span>
                                            <span>{viewInfo.description}</span>
                                        </div>
                                        <div className="ts-d-u-profile-single-row">
                                            <span>Timezone</span>
                                            <span>{`${slectedTimezone['timezone']} ${slectedTimezone['code']} [${slectedTimezone['utc_offset']} - ${slectedTimezone['utc_dst_offset']}]`}</span>
                                        </div>
                                        <div className="ts-d-u-profile-single-row">
                                            <span>Created Time</span>
                                            <span>{viewInfo.created_at}</span>
                                        </div>
                                        <div className="ts-d-u-profile-single-row">
                                            <span>Updated Time</span>
                                            <span>{viewInfo.updated_at}</span>
                                        </div>

                                        <div className="ts-d-u-profile-single-row">
                                            <span>Status</span>
                                            <span>{viewInfo.status == 1 ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </div>
                                </div>: ''}
                            {isViewTableReady && isSpecifyModalOperation === 'update' || isViewTableReady && isSpecifyModalOperation === 'insert' ?
                                <form className="g-3 needs-validation" encType="multipart/form-data">
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Name <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={viewInfo.name}
                                                id="name"
                                                placeholder="Write Name"
                                                onChange={this.onChangeHandler}
                                            />
                                            <div className="text-danger">{this.state.validationError.name}</div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                id={'description'}
                                                rows={4}
                                                placeholder={'Write description here'}
                                                className={'form-control'}
                                                name={'description'}
                                                onChange={this.onChangeHandler}
                                                defaultValue={viewInfo.description}
                                            >

                                            </textarea>
                                            {/*<div className="text-danger">{this.state.validationError.description}</div>*/}
                                        </div>
                                    </div>

                                    {/* <div className="row mb-1">
                                        <div className="col-md-6">
                                            <div><label className="form-label">Timezones<span className="text-danger">*</span></label></div>
                                            <Select
                                                name={'time_zone_id'}
                                                id={'time_zone_id'}
                                                style={{ width: 100+'%' }}
                                                showSearch
                                                optionFilterProp="children"
                                                placeholder={"select a timezone"}
                                                onChange={this.onSectChangeHandler}
                                                filterOption={(input, option) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                                filterSort={(optionA, optionB) =>
                                                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                                }
                                                value={viewInfo.time_zone_id}
                                                defaultValue={viewInfo.time_zone_id}
                                            >
                                                {timezones.map((item) => (
                                                    <Option
                                                        value={item.id}
                                                        key={item.id}
                                                    >
                                                        {item.timezone}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>

                                        <div className="col-md-6">
                                            <div><label className="form-label">Status</label></div>
                                            <Switch
                                                checkedChildren="Active"
                                                unCheckedChildren="Inactive"
                                                onChange={this.statusOnChange}
                                                defaultChecked={viewInfo.status === 0 ? false : true}
                                            />
                                        </div>

                                    </div> */}

                                    <Divider/>

                                    {/*{console.log(viewInfo.time_slots.length < 7)}*/}

                                    <div className={'row mb-1 mt-1'}>
                                        <div className="col-md-6">
                                            <div><label className="form-label">Select Business Hour</label></div>
                                            <Radio.Group
                                                onChange={this.onRadioChangeHandler}
                                                value={time_slot_type}>
                                                defaultValue={time_slot_type}>
                                                <Radio value={'C'}>Custom Hours</Radio>
                                                <Radio value={'F'}>24hrs * 7days</Radio>

                                            </Radio.Group>
                                        </div>
                                    </div>

                                    <div className="row mt-1">
                                        <div className={'col-md-12'}>
                                            {time_slot_type === 'C' ?
                                                <div className="ts-d-custom-hours-area mt-3">
                                                    {weekday.map((item,key)=>(
                                                        <button
                                                            key={key}
                                                            name={item.name}
                                                            value={item.name}
                                                            className={weekday[key].checked === false ? 'btn ts-d-custom-hours-btn' : 'btn ts-d-custom-hours-btn active'}
                                                            onClick={(e) => this.getCustomDaySlot(e, key)}
                                                        >
                                                            {item.name}
                                                        </button>
                                                    ))}
                                                </div>
                                                : ''
                                            }

                                            <Divider/>

                                            {weekday.map((item,key) =>(

                                                weekday[key].checked ===true && time_slot_type === 'C' ?
                                                    <div className={'row'} key={key}>
                                                        <div className={'col-md-4 mt-1'}>
                                                            <Input placeholder="Basic usage" name={'day'} value={item.name} />
                                                        </div>
                                                        <div className={'col-md-8 mt-1'}>
                                                            {/*start_time*/}
                                                            <TimePicker
                                                                onChange={(time, timeString)=>{
                                                                    weekday[key].start_time = timeString
                                                                    // let {weekday} = this.state;
                                                                    this.setState({weekday},()=>{
                                                                        console.log(weekday);
                                                                    })

                                                                }}
                                                                defaultValue={moment(weekday[key].start_time, format)} format={format}
                                                            />

                                                            {/*end_time*/}
                                                            <TimePicker
                                                                onChange={(time, timeString)=>{
                                                                    weekday[key].end_time = timeString;
                                                                    // let {weekday} = this.state;
                                                                    this.setState({weekday},()=>{
                                                                        console.log(weekday);
                                                                    })
                                                                }}
                                                                defaultValue={moment(weekday[key].end_time, format)} format={format}
                                                            />

                                                        </div>
                                                    </div>
                                                    : ''

                                            ))}
                                        </div>
                                    </div>
                                </form>: ''}
                        </div>
                    </Modal>
                </Layout>
            </React.Fragment>
        )
    }
}

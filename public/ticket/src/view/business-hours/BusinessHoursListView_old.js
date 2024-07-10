import React from 'react';
import Layout from "../../components/common/Layout";
import Api from '../../services/Api';
import DataTable from 'react-data-table-component';
import {ANTD_MESSAGE_MARGIN_TOP, API_URL} from "../../Config";
import Token from '../../services/Token';
import Pagination from '../../components/Pagination/Pagination';
import ActionButtons from '../../components/common/ActionButtons';
import AddActionButtons from '../../components/common/AddActionButton';
import {Modal, Button, AutoComplete, Input, Spin, Select, Switch, message, Radio,Divider, TimePicker} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import Helper from "../../services/Helper";


import moment from 'moment';

const format = 'HH:mm';

const { Option }    = Select;
const { confirm }   = Modal;

export default class BusinessHoursListView extends React.Component {

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
            viewInfo                : {},
            editFormData            : {
                id                  : '',
                name                : '',
                slug                : '',
                time_zone_id        : '',
                status              : '',
                holi_day_id         : '',
                description         : '',
                start_work_time     : '',
                end_work_time       : '',
                sun                     : {
                    checked: false,
                    start_time:"00:00",
                    end_time: "00:30",
                },
                mon                     : {
                    checked: false,
                    start_time:"00:00",
                    end_time: "00:30"
                },
                tues                    : {
                    checked: false,
                    start_time:"00:00",
                    end_time: "00:30"
                },
                wed                     : {
                    checked: false,
                    start_time:"00:00",
                    end_time: "00:30"
                },
                thurs                   : {
                    checked: false,
                    start_time:"00:00",
                    end_time: "00:30"
                },
                fri                     : {
                    checked: false,
                    start_time:"00:00",
                    end_time: "00:30"
                },
                sat                     : {
                    checked: false,
                    start_time:"00:00",
                    end_time: "00:30"
                },
                created_at          : '',
                updated_at          : '',
            },


            business_hour_time_type : 'N',
            businessTimezoneOption  : '',
            validationError         : {
                id                  : '',
                name                : '',
                slug                : '',
                description         : '',
                time_zone_id        : '',
                holi_day_id         : '',
                status              : '',
                created_at          : '',
                updated_at          : ''
            },
            timezones               : [],
            columns                 : [
                {
                    name            : 'NO.',
                    selector        : row => row.sl,
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
            data                    : [],
            weekday_button          : [
                {day : 'sun', active : false},
                {day : 'mon', active : false},
                {day : 'tues', active : false},
                {day : 'wed', active : false},
                {day : 'thurs', active : false},
                {day : 'fri', active : false},
                {day : 'sat', active : false},
            ],
        };
        this.handlePageClick        = this.handlePageClick.bind(this);
    }

    //api call methods start
    async getTimezones(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/timezones?page=' + page, [], (new Token()).get());
        } else{
            return await (new Api()).call('GET', API_URL + '/timezones?page=' + page + '&query='+ query, [], (new Token()).get());
        }

    }

    async getAll(page = null, query = null){
        if (query == null){
            return await (new Api()).call('GET', API_URL + '/business-hours?page=' + page, [], (new Token()).get(),this.params);
        } else{
            return await (new Api()).call('GET', API_URL + '/business-hours?page=' + page + '&query='+ query, [], (new Token()).get());
        }

    }

    async getUpdate(){
        return await (new Api()).call('PUT', API_URL + `/business-hours/${this.state.editFormData.id}`, this.state.editFormData, (new Token()).get());
    }

    async getAdd(){
        let {editFormData} = this.state;
        let objKey = [];

        Object.keys(editFormData).forEach((prop)=> objKey.push(prop));

        let dayArray = [];

        if (editFormData.sun.checked === true){
            dayArray.push({day : objKey[7], start_time : editFormData.sun.start_time, end_time: editFormData.sun.end_time})
        }

        if (editFormData.mon.checked === true){
            dayArray.push({day : objKey[8], start_time : editFormData.mon.start_time, end_time: editFormData.mon.end_time})
        }

        if (editFormData.tues.checked === true){
            dayArray.push({day : objKey[9], start_time : editFormData.tues.start_time, end_time: editFormData.tues.end_time})
        }

        if (editFormData.wed.checked === true){
            dayArray.push({day : objKey[10], start_time : editFormData.wed.start_time, end_time: editFormData.wed.end_time})
        }

        if (editFormData.thurs.checked === true){
            dayArray.push({day : objKey[11], start_time : editFormData.thurs.start_time, end_time: editFormData.thurs.end_time})
        }

        if (editFormData.fri.checked === true){
            dayArray.push({day : objKey[12], start_time : editFormData.fri.start_time, end_time: editFormData.fri.end_time})
        }

        if (editFormData.sat.checked === true){
            dayArray.push({day : objKey[13], start_time : editFormData.sat.start_time, end_time: editFormData.sat.end_time})
        }

        let formData = new FormData ();
        formData.append('name', editFormData.name);
        formData.append('description', editFormData.description);
        formData.append('time_zone_id', editFormData.time_zone_id);
        formData.append('status', editFormData.status);
        formData.append('time_slots', JSON.stringify(dayArray));

        // console.log(formData)


        return await (new Api()).call('POST', API_URL + '/business-hours', formData, (new Token()).get());
    }

    async updateBusinessHour(){

        this.setState({isLoading: true});
        this.setState({errors: null});

        try {

            const data     = this.state.editFormData;
            let formData = this.makeformData(data);

            formData.append('_method', "PUT");

            let response    = await (new Api()).call('POST', API_URL + '/business-hours/' + this.state.editFormData.id, formData, (new Token()).get());
            if (response.data.status_code == 200) {
                this.makeTableData(this.state.pageNumber);
                this.resetModal();
                message.success({
                    content: 'Successfully Updated.',
                    style: {
                        marginTop: ANTD_MESSAGE_MARGIN_TOP,
                    }
                });
            } else if (response.data.status == 400) {
                this.setState({submitLoading: false});
                this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
            }

        }catch (err) {
            // const {validationError} = this.state;
            // this.setState({submitLoading: false});
            // validationError[err.details[0].context.key] = err.details[0].message;
            // this.setState({ validationError: validationError });
            // validationError[err.details[0].context.key] ='';
        }

    }

    //api call methods end


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
        this.makeTableDataTimzones();
        this.makeTableData();
    }

    // operational work start
    addAction(){
        this.setState({isViewModalVisible:true});
        this.setState({isSpecifyModalOperation:'insert'});
        this.setState({viewModalTitle:"Add Business Hours"});
        let editFormData = {
            id :'',
            name : '',
            slug :'',
            description:'',
            time_zone_id: null,
            holi_day_id : '',
            status : 0,
            sun : {
                checked: false,
                start_time:"00:00",
                end_time: "00:30"
            },
            mon : {
                checked: false,
                start_time:"00:00",
                end_time: "00:30"
            },
            tues : {
                checked: false,
                start_time:"00:00",
                end_time: "00:30"
            },
            wed:{
                checked: false,
                start_time:"00:00",
                end_time: "00:30"
            },
            thurs :{
                checked: false,
                start_time:"00:00",
                end_time: "00:30"
            },
            fri :{
                checked: false,
                start_time:"00:00",
                end_time: "00:30"
            },
            sat :{
                checked: false,
                start_time:"00:00",
                end_time: "00:30"
            },
        };
        this.setState({editFormData : editFormData}, ()=>{
            this.setState({viewSpinning:false});
            this.setState({isViewTableReady:true});
            // this.setState({isViewTableReady:true});
        });
    }

    viewAction(item){
        this.setState({isViewModalVisible:true});
        this.setState({isSpecifyModalOperation:'view'});
        this.setState({viewModalTitle:"Business Hours Details"});
        let businessHour = this.state.data.find(collection => collection.id === item.id);
        this.setState({viewInfo:businessHour});
        this.setState({viewSpinning:false});
        this.setState({isViewTableReady:true});
    }

    editAction(item){
        this.setState({viewSpinning:true});
        this.setState({viewModalTitle:"Business Hours Details"});
        this.setState({isViewModalVisible:true});
        let businessHour = this.state.data.find((collection) => collection.id === item.id);
        let editFormData = {};
        for (var key in this.state.editFormData) {
            editFormData[key] = businessHour[key];
        }
        this.setState({editFormData : editFormData}, ()=>{
            this.setState({viewSpinning:false});
            this.setState({isViewTableReady:true});
        });
        this.setState({isSpecifyModalOperation:'edit'});
    }

    deleteAction(item){
        confirm({
            title: 'Are you sure delete this business hour?',
            icon: <ExclamationCircleOutlined />,
            content: 'Some descriptions',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk : async ()=>{
                let response = await (new Api()).call('DELETE', API_URL + '/business-hours/' + item.id, [], (new Token()).get());;
                if (response.data.status_code == 200) {
                    this.makeTableData();
                    this.resetModal();
                    message.success({
                        content: 'Deleted Successfully.',
                        style: {
                            marginTop: ANTD_MESSAGE_MARGIN_TOP,
                        }
                    });
                } else if (response.data.status == 400) {
                    this.setState({submitLoading: false});
                    this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
                }
            }
        });
    }
    // operational work end

    onChangeHandler = (e, key) => {
        const { editFormData } = this.state;
        editFormData[e.target.name] = e.target.value;
        this.setState({ editFormData });
    }

    onSectChangeHandler =(value)=> {
        let { editFormData } = this.state;
        if( value === undefined || value.length == 0 ){
            value = '';
        }
        editFormData.time_zone_id = value;
        this.setState({editFormData});
        // console.log(value);
    }

    statusOnChange =(checked, event)=>{
        let {editFormData}  = this.state;
        editFormData.status = checked ? 1 : 0;
        this.setState({editFormData: editFormData});
    }

    onRadioChangeHandler = (e)=>{
        let {weekday_button} = this.state;
        let {business_hour_time_type}  = this.state;
        business_hour_time_type = e.target.value;
        this.setState({business_hour_time_type});
        let {editFormData} = this.state;
        if (business_hour_time_type === 'Y'){
            weekday_button.forEach((item)=>{
                editFormData[item.day] = {checked : true, start_time:"00:00", end_time: "23:59"};
            })
        }else{
            weekday_button.forEach((item)=>{
                editFormData[item.day] = {checked : false, start_time:"00:00", end_time: "00:30"};
            })
        }
    }

    getDaysArrayCollection=(event,key)=>{
        event.preventDefault();
        let {weekday_button} = this.state;
        let {editFormData} = this.state;


        weekday_button[key].active = !weekday_button[key].active
        if (editFormData[weekday_button[key].day] === ""){
            editFormData[event.target.name] = {checked : true, start_time:"00:00", end_time: "00:30"};

        } else{
            editFormData[event.target.name] = {checked : true, start_time:"00:00", end_time: "00:30"};
        }
        this.setState({editFormData});
    }




    getOperationalView(){
        if (this.state.isSpecifyModalOperation === "view") {
            const {timezones} = this.state;
            let slectedTimezone = timezones.find(el => el.id === this.state.viewInfo.time_zone_id)
            return (
                <>
                    {/*{console.log(this.state.viewInfo)}*/}
                    <div className="ts-d-u-profile-preview-card">

                        <div className="ts-d-u-profile-single-row-area">
                            <div className="ts-d-u-profile-single-row">
                                <span>Name</span>
                                <span>{this.state.viewInfo.name}</span>
                            </div>
                            <div className="ts-d-u-profile-single-row">
                                <span>Slug</span>
                                <span>{this.state.viewInfo.slug}</span>
                            </div>
                            <div className="ts-d-u-profile-single-row">
                                <span>Description</span>
                                <span>{this.state.viewInfo.description}</span>
                            </div>
                            <div className="ts-d-u-profile-single-row">
                                <span>Timezone</span>
                                <span>{`${slectedTimezone['timezone']} ${slectedTimezone['code']} [${slectedTimezone['utc_offset']} - ${slectedTimezone['utc_dst_offset']}]`}</span>
                            </div>
                            <div className="ts-d-u-profile-single-row">
                                <span>Created Time</span>
                                <span>{this.state.viewInfo.created_at}</span>
                            </div>
                            <div className="ts-d-u-profile-single-row">
                                <span>Updated Time</span>
                                <span>{this.state.viewInfo.updated_at}</span>
                            </div>

                            <div className="ts-d-u-profile-single-row">
                                <span>Status</span>
                                <span>{this.state.viewInfo.status == 'true' ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                </>
            )

        }
        else{

            const {timezones} = this.state;
            return (
                <>
                    <form className="g-3 needs-validation" encType="multipart/form-data">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Name <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={this.state.editFormData.name}
                                    id="name"
                                    placeholder="Write Name"
                                    onChange={this.onChangeHandler}
                                />
                                <div className="text-danger">{this.state.validationError.name}</div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    id={'description'}
                                    rows={4}
                                    placeholder={'Write description here'}
                                    className={'form-control'}
                                    name={'description'}
                                    onChange={this.onChangeHandler}
                                >
                                    {this.state.editFormData.description}
                                </textarea>
                                <div className="text-danger">{this.state.validationError.description}</div>
                            </div>
                        </div>

                        <div className="row mb-1">
                            <div className="col-md-6">
                                <div><label className="form-label">Timezones</label></div>
                                <Select
                                    name={'time_zone_id'}
                                    id={'time-zone-id'}
                                    style={{ width: 350 }}
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
                                    defaultValue={this.state.editFormData.time_zone_id}
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
                        </div>

                        <Divider/>

                        <div className="row mb-1">
                            <div className="col-md-6">
                                <div><label className="form-label">Select Business Hour</label></div>
                                <Radio.Group
                                    onChange={this.onRadioChangeHandler}
                                    value={this.state.business_hour_time_type}>
                                    defaultValue={this.state.business_hour_time_type}>
                                    <Radio value={'N'}>Custom Hours</Radio>
                                    <Radio value={'Y'}>24hrs * 7days</Radio>

                                </Radio.Group>

                                {this.state.business_hour_time_type === 'N'?
                                    <div className="ts-d-custom-hours-area mt-3">
                                        {this.state.weekday_button.map((item,key) =>(
                                            <button key={key}
                                                    name={item.day}
                                                    onClick={(e)  =>this.getDaysArrayCollection(e,key)}
                                                    className={this.state.weekday_button[key].active ===false ? 'btn ts-d-custom-hours-btn' : 'btn ts-d-custom-hours-btn active'}
                                                    value={item.day}>
                                                {item.day.toLocaleUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    : ''
                                }
                                <Divider/>


                                {this.state.weekday_button.map((item,key) =>(

                                    this.state.weekday_button[key].active ===true && this.state.business_hour_time_type === 'N' ?
                                        <div className={'row'} key={key}>
                                            <div className={'col-md-4'}>
                                                <Input placeholder="Basic usage" name={'day'} value={item.day.toLocaleUpperCase()} />
                                            </div>
                                            <div className={'col-md-4'}>
                                                <TimePicker
                                                    onChange={(time, timeString)=>{
                                                        // console.log(time, timeString, item.day)
                                                        let {editFormData} = this.state;
                                                        let dayObj = editFormData[item.day];
                                                        dayObj.start_time = timeString;
                                                        editFormData[item.day] = dayObj;

                                                        // editFormData[item.day] = {checked : true, start_time : timeString, end_time : ''}
                                                        this.setState({editFormData})
                                                        // console.log(editFormData)
                                                    }}
                                                    defaultValue={moment('00:00', format)} format={format} />

                                            </div>
                                            <div className={'col-md-4'}>
                                                <TimePicker
                                                    onChange={(time, timeString)=>{
                                                        let {editFormData} = this.state;
                                                        let dayObj = editFormData[item.day];
                                                        dayObj.end_time = timeString;
                                                        editFormData[item.day] = dayObj;
                                                        // console.log(day);

                                                        // editFormData[item.day] = {checked : true, start_time : start_time,  end_time : timeString}

                                                        this.setState({editFormData})
                                                        // console.log(editFormData)
                                                    }}
                                                    defaultValue={moment('00:30', format)} format={format} />
                                            </div>
                                        </div>
                                        : ''

                                ))}
                            </div>
                        </div>

                        <div className="row mb-1">
                            <div className="col-md-4">
                                <div><label className="form-label">Status</label></div>
                                <Switch
                                    checkedChildren="Active"
                                    unCheckedChildren="Inactive"
                                    onChange={this.statusOnChange}
                                    defaultChecked={this.state.editFormData.status === 0 ? false : true}
                                />
                            </div>
                        </div>
                    </form>
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
                        sl              : this.state.serialCount,
                        id              : collection.id,
                        name            : collection.name,
                        slug            : collection.slug,
                        description     : collection.description,
                        time_zone_id    : collection.time_zone_id,
                        holi_day_id     : collection.holi_day_id,
                        created_at      : collection.created_at,
                        updated_at      : collection.updated_at,
                        status          : collection.status,
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
        } else if (status === 'update'){
            this.getUpdate().then(function (response) {
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
        this.setState({isViewModalVisible: false});
        this.setState({viewSpinning: false});
        this.setState({isViewTableReady: false});
        this.setState({businessHours: null});
        this.setState({errors: null});
        this.setState({isLoading:false});
        this.setState({isSpecifyModalOperation : ''})
        this.setState({business_hour_time_type : 'Y'})
        let {weekday_button} = this.state;
        weekday_button = [
            {day : 'sun', active : false},
            {day : 'mon', active : false},
            {day : 'tues', active : false},
            {day : 'wed', active : false},
            {day : 'thurs', active : false},
            {day : 'fri', active : false},
            {day : 'sat', active : false},
        ];

        this.setState({weekday_button});
    }
    /* End Modal Methods */
    render() {
        return (
            <Layout>
                <Modal
                    width="75%"
                    title={this.state.viewModalTitle}
                    visible={this.state.isViewModalVisible}
                    confirmLoading={this.state.confirmViewLoading}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                            Close
                        </Button>,
                        <Button
                            className={ this.state.isSpecifyModalOperation != "edit" ? "d-none" : ""}
                            loading={this.state.isLoading}
                            key="Update"
                            type="primary"
                            onClick={(e)=>this.handleOk(this.state.isSpecifyModalOperation)}
                        >
                            Submit
                        </Button>,
                        <Button
                            className={ this.state.isSpecifyModalOperation != "delete" ? "d-none" : ""}
                            loading={this.state.isLoading}
                            key="Delete"
                            type="danger"
                            onClick={(e)=>this.handleOk(this.state.isSpecifyModalOperation)}
                        >
                            Delete
                        </Button>,
                        <Button
                            className={ this.state.isSpecifyModalOperation != "insert" ? "d-none" : ""}
                            loading={this.state.isLoading}
                            key="Add"
                            type="primary"
                            onClick={(e)=>this.handleOk(this.state.isSpecifyModalOperation)}
                        >
                            Submit
                        </Button>,
                    ]}>
                    <div className={"spinner-centered mt-2"}>
                        {this.state.isViewTableReady ? this.getOperationalView() : ''}
                    </div>
                </Modal>
                <div className={"ts-d-top-header mb-4"}>
                    <div className={"ts-d-acc-name"}>
                        <span className={"bi bi-list"}/>
                        <span className={"ts-d-acc-name-text text-uppercase"}> Business Hours List</span>
                    </div>

                    <div className={"form-group m-0"}>
                        <AddActionButtons addActionProp={()=>this.addAction()}/>
                    </div>

                </div>
                {/*Sub Menu Area*/}
                <div className="container-fluid">
                    {/*Submenu Area*/}
                    <div class="ts-d-submenu-area">
                        <div class="ts-d-left-toolbar ts-d-top-toolbar">
                            <ul>
                                <li>
                                    <a href="">
                                        <i class="bi bi-house-door"></i> Home
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i class="bi bi-ui-checks"></i> My Job
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i class="bi bi-file-lock"></i> Change Password
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/*End Submenu Area*/}
                </div>
                {/*Search Components*/}
                <div className="container-fluid p-0 mb-4">
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
                </div>
                <div className="container-fluid">
                    <div className={"ts-d-common-list-view"}>
                        <DataTable
                            columns={this.state.columns}
                            data={this.state.data}
                            noDataComponent={<Spin size="midium"  tip="Getting Data..." spinning={this.state.dataTableSpinning}></Spin>}
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

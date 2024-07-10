import React, { Component } from 'react'
import { DatePicker, Select } from 'antd';
import Api from "../../services/Api";
import {API_URL} from "../../Config";
import Token from "../../services/Token";
import moment from 'moment';
const { Option } = Select;

export default class Form extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount() {
        
    }

    async getAllSource() {
        return await (new Api()).call('GET', API_URL + `/getList/sources?page=*`, [], (new Token()).get());
    }

    render() {
        return (
            <>
                <form>
                    <div className="form-group">
                        <label>Date <span className="text-danger">*</span></label>
                        <DatePicker
                            defaultValue = {this.props.holidayFormData.date != '' ? moment(this.props.holidayFormData.date, 'YYYY-MM-DD') : null}
                            onChange     = {this.props.dateOnChange}
                            style        = {{width: '100%'}}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput">Name <span className="text-danger">*</span></label>
                        <input
                            type        = "text"
                            className   = "form-control"
                            id          = "name"
                            name        = "name"
                            placeholder = "Name of holiday"
                            value       = {this.props.holidayFormData.name}
                            onChange    = {this.props.onChangeHandler}
                        />
                    </div>
                </form>
            </>
        )
    }
}

import React, { Component } from 'react'
import { Select } from 'antd';
import { Input } from 'antd';

const { TextArea } = Input;

const { Option } = Select;


export default class Form extends Component {
    render() {
        return (
            <>
                <form>
                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput">Name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" id="name" name="name" placeholder="Name of Priority" value={this.props.priorityFormData.name} onChange={this.props.onChangeHandler}/>
                    </div>
               
                  
                </form>
            </>
        )
    }
}

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
                        <label htmlFor="formGroupExampleInput">Title <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" id="title" name="title" placeholder="Name of Title" value={this.props.cannedMsgFormData.title} onChange={this.props.onChangeHandler}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput2">Description <span className="text-danger">*</span></label>
                        <TextArea type="text" rows={4}  className="form-control" id="description" name="description" placeholder="Some description about Canned Message" value={this.props.cannedMsgFormData.description} onChange={this.props.onChangeHandler} />
                        {/* <input type="text" className="form-control" id="description" name="description" placeholder="Some description about group" value={this.props.cannedMsgFormData.description} onChange={this.props.onChangeHandler}/> */}
                    </div>
                  
                </form>
            </>
        )
    }
}

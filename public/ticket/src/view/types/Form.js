import React, { Component } from 'react'
import { Select } from 'antd';
import { Input,InputNumber  } from 'antd';

const { TextArea } = Input;

const { Option } = Select;


export default class Form extends Component {

    constructor(props){
        super(props);
    }


    render() {
        return (
            <>
                <form>
                    <div className="form-group">
                        <label htmlFor="name">Name <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            id="name" 
                            name="name"
                            placeholder="Name of Type"
                            value={this.props.typeFormData.name}
                            onChange={this.props.onChangeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput">Description</label>
                        <TextArea
                            className="form-control"
                            rows={4}
                            id={'description'}
                            name={'description'}
                            value={this.props.typeFormData.description}
                            onChange={this.props.onChangeHandler}
                        />
                    </div>

                    <div className="form-group ts-d-sla-border mt-4">
                        <span className="ts-d-sla-text">SLA</span>
                        <div className="row">
                            <div className="col-md-2">
                                <label htmlFor="formGroupExampleInput">Day</label>
                                <div>
                                    <input
                                        className="form-control"
                                        type={'number'}
                                        id={'day'}
                                        name={'day'}
                                        placeholder={'Enter day here'}
                                        min={0}
                                        // defaultValue={this.props.typeFormData.day}
                                        value={this.props.typeFormData.day}
                                        onChange={this.props.onChangeHandler}
                                    />
                                </div>
                            </div>

                            <div className="col-md-2">
                                <label htmlFor="formGroupExampleInput">Hour</label>
                                <div>
                                    <input
                                        className="form-control"
                                        type={'number'}
                                        id={'hour'}
                                        name={'hour'}
                                        placeholder={'Enter hour here'}
                                        min={0}
                                        max={23}
                                        title={'Not more than 23'}
                                        // defaultValue={this.props.typeFormData.day}
                                        value={this.props.typeFormData.hour}
                                        onChange={this.props.onChangeHandler}
                                        onKeyDown={(e)=> {
                                            let key = e.key;
                                            let value = e.target.value;
                                            let new_value = Number(value + key);
                                            let max = Number(e.target.max);
                                            if(new_value > max){ e.preventDefault();}}
                                        }
                                    />
                                </div>
                            </div>

                            <div className="col-md-2">
                                <label htmlFor="formGroupExampleInput">Minute</label>
                                <div>
                                    <input
                                        className="form-control"
                                        type={'number'}
                                        id={'min'}
                                        name={'min'}
                                        placeholder={'Enter minute here'}
                                        min={0}
                                        max={59}
                                        title={'Not more than 60'}
                                        step={15}
                                        // defaultValue={this.props.typeFormData.min}
                                        value={this.props.typeFormData.min}
                                        onChange={this.props.onChangeHandler}
                                        onKeyDown={(e)=> {
                                            let key = e.key;
                                            let value = e.target.value;
                                            let new_value = Number(value + key);
                                            let max = Number(e.target.max);
                                            if(new_value > max){ e.preventDefault();}}
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </>
        )
    }
}

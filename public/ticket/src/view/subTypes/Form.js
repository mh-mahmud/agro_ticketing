import React, { Component } from 'react'
import { Input, Select  } from 'antd';
import {API_URL} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';

const { TextArea } = Input;
const { Option } = Select;

export default class Form extends Component {

    constructor(props){
        super(props);

        this.state = {
            categories : [],
        }
    }

    async getAllTypes(){

        return await (new Api()).call('GET', API_URL + '/types?page=*', [], (new Token()).get());

    }

    componentDidMount(){
        let allTypes = this.getAllTypes();
        let categories = [];
        allTypes.then((response)=>{

            response.data.collections.map((type)=>{
                categories.push(<Option
                    value   ={type.id}
                    key     ={type.id}
                >
                    {type.name}
                </Option>);
            });
            this.setState({categories});
        });
    }

    render() {

        return (
            <>
                <form>
                    <div className="row">

                        <div className="form-group col-md-6 ts-d-subtype-category">
                            <label htmlFor="name" className={"d-block"}>Category <span className="text-danger">*</span></label>
                            <Select
                                style={{width:'100%'}}
                                showSearch
                                placeholder="Search to Select"
                                optionFilterProp="children"
                                onSelect={this.props.typeOnChange}
                                defaultValue={this.props.typeFormData.category}
                            >
                                {this.state.categories}
                            </Select>
                        </div>

                        <div className="form-group col-md-6">
                            <label htmlFor="name">Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="name" name="name"
                                placeholder="Name of Type"
                                value={this.props.typeFormData.name}
                                onChange={this.props.onChangeHandler}
                            />
                        </div>

                        <div className="form-group col-12">
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
                                        max={24}
                                        title={'Not more than 23'}
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
                                        max={60}
                                        title={'Not more than 60'}
                                        step={15}
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

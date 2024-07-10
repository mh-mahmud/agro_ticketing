import React, { Component } from 'react'
import {Select} from 'antd';
import {API_URL} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';

const { Option }    = Select;

export default class Form extends Component {

    constructor(props) {
        super(props);
        this.state = {
            roleChildren    : null,
        }
    }
    
    generateRolesOption() {

        const roleChildren = [];
        this.props.roles.data.role_list.forEach((role, index) => {
            roleChildren.push(<Option
                key={role.id}
                value={role.id}
                label={role.name}
            >
                <div className="demo-option-label-item">{role.name}</div>
            </Option>);
        })
        this.setState({roleChildren});

    }

    componentDidMount() {
        this.generateRolesOption();
    }

    render() {
        return (
            <>
                <form>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="formGroupExampleInput">Skill ID. <span className="text-danger">*</span></label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="skill_id" 
                                name="skill_id" 
                                placeholder="Skill ID" 
                                value={this.props.crmSkillRoleFormData.skill_id} 
                                onChange={this.props.inputOnChangeHandler}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Roles <span className="text-danger">*</span></label>
                            {
                                <Select
                                    style={{width: '100%'}}
                                    placeholder="Select One"
                                    defaultValue={this.props.crmSkillRoleFormData.role_id}
                                    onChange={this.props.handleRoleSelect}
                                    optionLabelProp="label"
                                >
                                    {this.state.roleChildren}
                                </Select>
                            }
                        </div>
                    </div>
                </form>
            </>
        )
    }
}

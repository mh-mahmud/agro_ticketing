import React, { Component } from 'react'
import { Select, Switch } from 'antd';
import Api from "../../services/Api";
import {API_URL} from "../../Config";
import Token from "../../services/Token";

const { Option } = Select;

export default class Form extends Component {
    constructor(props){
        super(props);
        
        this.state = {
            group: {
                selectOptions: [],
                // defaultValue: 0
            },
        }
    }

    componentDidMount() {
        let allGroup = this.getAllGroup();
        allGroup.then((response) => {
            let {group} = this.state;
            let {selectOptions} = group;
            selectOptions = []; // Reset
            let allData = response.data.group_list;
            allData.map((collection) => {
                if (collection.id !== this.props.groupFormData.groupId) {
                    selectOptions.push(
                        <Option
                            key={collection.id}
                            value={collection.id}
                            disabled={collection.id === Number(this.props.groupFormData.parent_id)}
                        >
                            {collection.name}
                        </Option>
                    );
                }
            });
            group.selectOptions = selectOptions;
            this.setState({group});
        });
    }

    ticketApprovalOnChange(){

    }

    async getAllGroup() {
        return await (new Api()).call('GET', API_URL + `/getList/groups?page=*`, [], (new Token()).get());
    }

    render() {
        return (
            <>
                <form>
                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput">Name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" id="name" name="name" placeholder="Name of group" value={this.props.groupFormData.name} onChange={this.props.onChangeHandler}/>
                    </div>

                    <div className="form-group">
                        <label>Parent </label>
                        <Select
                            defaultValue={Number(this.props.groupFormData.parent_id)}
                            placeholder={"Source"}
                            onChange={(value) => this.props.handleSelectOnChange('parent_id', value)}
                            style={{width: '100%'}}
                        >
                            <Option
                                value={0}
                                // searchableData='---'
                            >
                                ---
                            </Option>
                            {this.state.group.selectOptions}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput2">Description</label>
                        <input type="text" className="form-control" id="description" name="description" placeholder="Some description about group" value={this.props.groupFormData.description} onChange={this.props.onChangeHandler}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput2">Agents</label>
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Assign agents to this group"
                            defaultValue={this.props.selectedAgents}
                            onChange={this.props.handleAgentsInput}
                            optionFilterProp="searchableData"
                            filterOption={true}
                        >
                            {this.props.agentSelectOptions}
                        </Select>
                    </div>
                    <div className="form-group">
                        <label>Need Ticket Approval &nbsp;</label>
                        <Switch
                            checkedChildren="On"
                            unCheckedChildren="Off"
                            onChange={this.props.handleTicketApproval}
                            defaultChecked={this.props.groupFormData.need_ticket_approval == 1 ? true : false}
                        />
                    </div>
                </form>
            </>
        )
    }
}

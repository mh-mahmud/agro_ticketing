import React, { Component } from 'react'
import { DatePicker, Select } from 'antd';
import Api from "../../../services/Api";
import { API_URL } from "../../../Config";
import Token from "../../../services/Token";

const { Option } = Select;


export default class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {
            groups: {
                selectOptions: [],
                defaultValue: 0
            },
        }
    }
    async getAllGroups() {
        return await (new Api()).call('GET', API_URL + `/getList/groups?page=*`, [], (new Token()).get());
    }

    componentDidMount() {
        //group
        let allGroups = this.getAllGroups();
        allGroups.then((response) => {
            let {groups} = this.state;
            let {selectOptions} = groups;
            selectOptions = []; // Reset
            response.data.group_list.map((group) => {
                selectOptions.push(<Option
                    key={group.id}
                    value={group.id}
                >
                    {group.name}
                </Option>);
            });
            groups.selectOptions = selectOptions;
            this.setState({groups});
        });

    }
    render() {
        return (
            <>
                <div className="ts-d-sr-area">
                    <div className="ts-d-sr-search-main">
                    <div className="ts-d-sr-start-date">
                            <p><strong>To:</strong> 
                            <DatePicker 
                                placeholder ="Start date" 
                                style       ={{ width: '100%' }}
                                onChange    ={(date, dateString)=>this.props.dateOnchange(dateString, 'start_date')}
                            /></p>
                        </div>
                        <div className="ts-d-sr-end-date">
                            <p><strong>From: </strong>
                            <DatePicker 
                                placeholder="End Date" 
                                onChange    ={(date, dateString)=>this.props.dateOnchange(dateString, 'end_date')}
                                style={{ width: '100%' }} 
                            /></p>
                        </div>
                        <div className="ts-d-sr-select">
                            <p><strong>Group:</strong> <Select
                                
                                placeholder={"Group"}
                                onChange={this.props.groupChangeHandler}
                                style={{ width: '100%' }}
                            >
                                <Option>
                                    All
                                </Option>
                                {this.state.groups.selectOptions}
                            </Select>
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => {
                            this.props.searchTicketByField()
                        }}>Search</button>
                    </div>
                </div>

            </>
        )
    }

}

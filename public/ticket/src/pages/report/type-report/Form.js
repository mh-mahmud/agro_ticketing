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
            type: {
                selectOptions: [],
                defaultValue: 0
            },
        }
    }
    async getAllTypes() {
        return await (new Api()).call('GET', API_URL + `/getList/all-types?page=*`, [], (new Token()).get());
    }

    componentDidMount() {
        //type
        let allTypes = this.getAllTypes();
        allTypes.then((response) => {
            let { type } = this.state;
            let { selectOptions } = type;
            selectOptions = []; // Reset
            response.data.collections.map((item) => {
                selectOptions.push(<Option
                    key={item.id}
                    value={item.id}
                >
                    {item.name}
                </Option>);
            });
            type.selectOptions = selectOptions;
            this.setState({ type });
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
                            <p><strong>Type:</strong> <Select
                               
                                placeholder={"Type"}
                                onChange={this.props.typeChangeHandler}
                                style={{ width: '100%' }}
                            >
                                <Option >
                                   All
                                </Option>
                                {this.state.type.selectOptions}
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

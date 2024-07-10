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
            source: {
                selectOptions: [],
                defaultValue: 0
            },
        }
    }
    async getAllSource() {
        return await (new Api()).call('GET', API_URL + `/getList/sources?page=*`, [], (new Token()).get());
    }

    componentDidMount() {
        //source
        let allSource = this.getAllSource();
        allSource.then((response) => {
            let { source } = this.state;
            let { selectOptions } = source;
            selectOptions = []; // Reset
            response.data.collections.map((item) => {
                selectOptions.push(<Option
                    key={item.id}
                    value={item.id}
                >
                    {item.name}
                </Option>);
            });
            source.selectOptions = selectOptions;
            this.setState({ source });
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
                            <p><strong>Source:</strong>
                                <Select
                                    placeholder={"Source"}
                                    onChange={this.props.sourceChangeHandler}
                                    style={{ width: '100%' }}
                                >
                                <Option>
                                   All
                                </Option>
                                {this.state.source.selectOptions}
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
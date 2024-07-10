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
            statuses: {
                selectOptions: [],
                defaultValue: 0
            },
        }
    }
    async getAllStatus() {
        return await (new Api()).call('GET', API_URL + `/getList/statuses?page=*`, [], (new Token()).get());
    }

    componentDidMount() {
          //status
          let allStatus = this.getAllStatus();
          allStatus.then((response) => {
              // console.log(response.data.collections)
              let {statuses} = this.state;
              let {selectOptions} = statuses;
              selectOptions = []; // Reset
              response.data.collections.map((item) => {
                  selectOptions.push(<Option
                      key={item.id}
                      value={item.id}
                  >
                      {item.name}
                  </Option>);
              });
              statuses.selectOptions = selectOptions;
              this.setState({statuses});
          });
    }
    render() {
        return (
            <>
                <div className="ts-d-sr-area">
                    <div className="ts-d-sr-search-main">
                        <div className="ts-d-sr-start-date">
                            <p>
                                <strong>To:</strong>
                                <DatePicker
                                    placeholder="Start date"
                                    style={{ width: "100%" }}
                                    onChange={(date, dateString) =>
                                        this.props.dateOnchange(
                                            dateString,
                                            "start_date"
                                        )
                                    }
                                />
                            </p>
                        </div>
                        <div className="ts-d-sr-end-date">
                            <p>
                                <strong>From: </strong>
                                <DatePicker
                                    placeholder="End Date"
                                    onChange={(date, dateString) =>
                                        this.props.dateOnchange(
                                            dateString,
                                            "end_date"
                                        )
                                    }
                                    style={{ width: "100%" }}
                                />
                            </p>
                        </div>
                        <div className="ts-d-sr-select">
                            <p>
                                <strong>Status:</strong>{" "}
                                <Select
                                    placeholder={"Status"}
                                    onChange={this.props.statusChangeHandler}
                                    style={{ width: "100%" }}
                                >
                                    <Option>All</Option>
                                    {this.state.statuses.selectOptions}
                                </Select>
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                this.props.searchTicketByField();
                            }}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </>
        );
    }

}

import React, { Component } from 'react'
import { Select } from 'antd';
import Api from "../../services/Api";
import {API_URL} from "../../Config";
import Token from "../../services/Token";
const { Option } = Select;


export default class Form extends Component {
    constructor(props){
        super(props);
        // console.log(props)
        this.state = {
            source: {
                selectOptions: [],
                // defaultValue: 0
            },
        }
    }
    componentDidMount() {
        let allSource = this.getAllSource();
        allSource.then((response) => {
            let {source} = this.state;
            let {selectOptions} = source;
            selectOptions = []; // Reset
            let allData = response.data.collections;


            allData.map((collection) => {
                if (collection.id !== this.props.sourceFormData.sourceId) {
                    // console.log(item)
                    selectOptions.push(
                        <Option
                            key={collection.id}
                            value={collection.id}
                            disabled={collection.id === Number(this.props.sourceFormData.parent_id)}
                        >
                            {collection.name}
                        </Option>);
                }


            });
            source.selectOptions = selectOptions;
            this.setState({source});
        });
    }

    async getAllSource() {
        return await (new Api()).call('GET', API_URL + `/getList/sources?page=*`, [], (new Token()).get());
    }



    render() {
        return (
            <>
                <form>
                    <div className="form-group">
                        <label htmlFor="formGroupExampleInput">Name <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            placeholder="Name of Source"
                            value={this.props.sourceFormData.name}
                            onChange={this.props.onChangeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label>Parent </label>
                        <Select
                            defaultValue={Number(this.props.sourceFormData.parent_id)}
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
                            {this.state.source.selectOptions}
                        </Select>
                    </div>
                </form>
            </>
        )
    }
}

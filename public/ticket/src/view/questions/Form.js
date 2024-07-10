import React, {Component} from 'react'
import {Input, Select} from 'antd';
import {API_URL} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';

const {TextArea} = Input;
const {Option} = Select;

export default class Form extends Component {

    constructor(props) {
        super(props);

        this.state = {
            categories: {
                selectOptions: [],
                defaultValue: 0
            }
        }
    }

    async getAllTypes() {

        return await (new Api()).call('GET', API_URL + '/types?page=*', [], (new Token()).get());

    }

    componentDidMount() {
        let allTypes = this.getAllTypes();
        let categories = this.state.categories;
        let selectOptions = [];
        allTypes.then((response) => {
            response.data.collections.map((type) => {
                selectOptions.push(<Option
                    value={type.id}
                    key={type.id}
                >
                    {type.name}
                </Option>);
            });
            categories.selectOptions = selectOptions;
            this.setState({categories});
        });
    }

    render() {

        return (
            <>
                <form>
                    <div className="row">
                        <div className="form-group col-md-6">
                            <label className={"d-block"}>Category <span className="text-danger">*</span></label>
                            <Select
                                showSearch
                                style={{width: '100%'}}
                                placeholder="Search to Select"
                                optionFilterProp="children"
                                onSelect={this.props.typeOnChange}
                                defaultValue={this.props.typeFormData.type_id}
                            >
                                <Option
                                    value={0}
                                    searchableData='---'
                                    disabled={true}
                                >
                                    --Select--
                                </Option>
                                {this.state.categories.selectOptions}
                            </Select>
                        </div>
                        <div className="form-group col-md-6">
                            <label className={"d-block"}>Sub Category </label>
                            <Select
                                showSearch
                                value={this.props.typeFormData.sub_type_id}
                                style={{width: '100%'}}
                                placeholder="Select"
                                optionFilterProp="children"
                                onSelect={this.props.subTypeOnChange}
                                defaultValue={this.props.typeFormData.sub_type_id}
                            >
                                <Option
                                    value={0}
                                    searchableData='---'
                                    disabled={true}
                                >
                                    --Select--
                                </Option>
                                {this.props.subTypes.selectOptions}
                            </Select>
                        </div>
                        <div className="form-group col-12">
                            <label htmlFor="question">Question <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="question"
                                name="question"
                                placeholder="Question"
                                value={this.props.typeFormData.question}
                                onChange={this.props.onChangeHandler}
                            />
                        </div>
                    </div>


                </form>
            </>
        )
    }
}

import React from 'react';
import { AutoComplete, Input } from "antd";
// import { SearchOutlined } from '@ant-design/icons';


import "antd/dist/antd.css";

function onSelect(value) {
    console.log("onSelect", value);
}

export default class AutoSearch extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            dataSource: []
        };
    }

    handleSearch = value => {
        this.setState({
            dataSource: !value ? [] : [value, value + value, value + value + value]
        });
    }

    handleBulkSearch = (e) =>{
        const name = e.target.value;
    }

    render() {
        let { dataSource } = this.state;

        return(
            <>
                <AutoComplete
                    dataSource={dataSource}
                    style={{ width: 200 }}
                    onSelect={onSelect}
                    // onSearch={this.handleSearch}
                    onKeyUp={(e) => this.handleBulkSearch(e)}
                    placeholder="input here"
                >
                    <Input suffix={<SearchOutlined type="search" />} />
                </AutoComplete>
            </>
        )
    }
}

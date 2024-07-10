import React, { Component } from 'react'
import Api from "../../services/Api";
import {API_URL} from "../../Config";
import Token from "../../services/Token";

export default class View extends Component {
    constructor(props){
        super(props)

        this.state = {

            source: {},
            sources: [],
            parent_source: ''
        }


        this.state.source = props.targetedSource
        this.state.sources = props.sources

    }
    componentDidMount() {
        let item = this.state.sources.filter((item)=> item.sourceId === Number(this.state.source.parent_id))
        this.setState({parent_source : item[0]})
    }

    render() {
        return (
            <>
                <table className="table table-hover">
                    <tbody>
                    <tr>
                        <th width="120px">Name</th>
                        <td>:</td>
                        <td>{this.props.targetedSource.name}</td>
                    </tr>

                    {this.state.parent_source != null ?
                        <tr>
                            <th width="120px">Parent</th>
                            <td>:</td>
                            <td>{this.state.parent_source.name}</td>
                        </tr>
                        :
                        ''
                    }



                    </tbody>
                </table>


            </>
        )
    }
}

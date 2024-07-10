import React, { Component } from 'react'

export default class View extends Component {
    render() {
        return (
            <>
                <table className="table table-hover">
                    <tbody>
                        <tr>
                            <th width="120px">Name</th>
                            <td>:</td>
                            <td>{this.props.targetedType.name}</td>
                        </tr>

                        <tr>
                            <th width="120px">Description</th>
                            <td>:</td>
                            <td>{this.props.targetedType.description}</td>
                        </tr>

                        <tr>
                            <th width="120px">SLA</th>
                            <td>:</td>
                            <td>
                                {this.props.targetedType.day} Day : {this.props.targetedType.hour} Hour : {this.props.targetedType.min} Minutes
                            </td>
                        </tr>
                       
                    </tbody>
                </table>

                
            </>
        )
    }
}

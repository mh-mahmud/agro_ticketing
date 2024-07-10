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
                            <td>{this.props.targetedStatus.name}</td>
                        </tr>
                       
                    </tbody>
                </table>

                
            </>
        )
    }
}

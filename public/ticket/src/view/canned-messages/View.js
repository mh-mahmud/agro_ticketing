import React, { Component } from 'react'

export default class View extends Component {
    render() {
        return (
            <>
                <table className="table table-hover">
                    <tbody>
                        <tr>
                            <th width="120px">Title</th>
                            <td>:</td>
                            <td>{this.props.targetedCannedMsg.title}</td>
                        </tr>
                        <tr>
                            <th>Description</th>
                            <td>:</td>
                            <td>
                                <span dangerouslySetInnerHTML={{__html: this.props.targetedCannedMsg.description.replace(/\n\r?/g, '<br/>')}}></span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                
            </>
        )
    }
}

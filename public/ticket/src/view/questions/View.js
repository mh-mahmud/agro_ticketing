import React, { Component } from 'react'

export default class View extends Component {
    render() {
        return (
            <>
                <table className="table table-hover">
                    <tbody>
                        
                        <tr>
                            <th width="80px">Question</th>
                            <td>:</td>
                            <td>{this.props.targetedQuestion.question}</td>
                        </tr>

                        <tr>
                            <th width="80px">Category</th>
                            <td>:</td>
                            <td>{this.props.targetedQuestion.type.name}</td>
                        </tr>
                       
                    </tbody>
                </table>                
            </>
        )
    }
}

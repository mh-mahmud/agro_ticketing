import React, { Component } from 'react'
import {Tooltip} from 'antd';

export default class ActionButtons extends Component {
    render() {
        return (
            <>
                        {
                            this.props.viewActionProp !== undefined ?
                                <li className="list-inline-item">
                                    <Tooltip title="View">
                                        <button onClick={this.props.viewActionProp} className="btn btn-primary btn-sm" type="button" data-toggle="tooltip" data-placement="top"><i className="bi bi-eye-fill"></i></button>
                                    </Tooltip>
                                </li>
                            : ''
                        }
                        {
                            this.props.isEditPermitted || this.props.isEditPermitted === undefined ?
                            <li className="list-inline-item">
                                <Tooltip title="Edit">
                                    <button onClick={this.props.editActionProp} className="btn btn-success btn-sm" type="button" data-toggle="tooltip" data-placement="top"><i className="bi bi-pencil-fill"></i></button>
                                </Tooltip>
                            </li> : ''
                        }
                        {
                            this.props.isDeletePermitted || this.props.isDeletePermitted === undefined ?
                            <li className="list-inline-item">
                                <Tooltip title="Delete">
                                    <button onClick={this.props.deleteActionProp} className="btn btn-danger btn-sm" type="button" data-toggle="tooltip" data-placement="top"><i className="bi bi-trash-fill"></i></button>
                                </Tooltip>
                            </li> : ''
                        }
                    
            </>
        )
    }
}

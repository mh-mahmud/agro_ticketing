import React, { Component } from 'react';
import {Tooltip} from 'antd';

export default class AddActionButtons extends Component {
    render() {
        return (
            <div>
                <ul className="list-inline m-0">
                    <li className="list-inline-item">
                        <Tooltip placement="left" title="Add New">
                            <button onClick={this.props.addActionProp} className="ts-d-add-btn " type="button" data-toggle="tooltip" data-placement="top">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                     className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                    <path
                                        d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                                </svg>
                            </button>
                        </Tooltip>
                    </li>
                </ul>
            </div>
        )
    }
}
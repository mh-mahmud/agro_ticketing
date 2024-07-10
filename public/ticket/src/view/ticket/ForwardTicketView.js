import React, {Component} from 'react'
import TICKET_USER from '../../assets/images/ct-user.svg';
import {NavLink} from "react-router-dom";
import ForwardTicketForm from './ForwardTicketForm';

export default class ForwardTicketView extends Component {

    constructor() {
        super();
    }

    render() {
        return (
            <>
                <div className="ts-d-top-header mb-4">
                    <div className="ts-d-acc-name">
                        <span className="bi bi-list"/>
                        <span className="ts-d-acc-name-text text-uppercase">Ticket Forward</span>
                    </div>
                </div>

                {/* Ticket Area*/}
                <div className="ts-d-tickets-area">

                    {/*Submenu Area*/}
                    {/* <div className="ts-d-submenu-area">
                        <div className="ts-d-left-toolbar ts-d-top-toolbar">
                            <ul>
                                <li>
                                    <a href="">
                                        <i className="bi bi-house-door"></i> Home
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i className="bi bi-ui-checks"></i> My Job
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i className="bi bi-file-lock"></i> Change Password
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="ts-d-right-toolbar ts-d-top-toolbar">
                            <ul>
                                <li>
                                    <NavLink to="/open-ticket">
                                        <i className="bi bi-folder2-open"></i> Opened Ticket
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/close-ticket">
                                        <i className="bi bi-folder-x"></i> Close Ticket
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                    </div> */}
                    {/*End Submenu Area*/}

                    {/* Main Tickets Area*/}
                    <div className="ts-d-tickets-main">
                        <div className="ts-d-ct-forms">
                            <ForwardTicketForm/>
                        </div>
                    </div>
                    {/*End Main Tickets Area*/}
                </div>
                {/*End Ticket Area*/}
            </>
        )
    }
}
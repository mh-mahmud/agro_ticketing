import React from "react";
import Layout from "../../components/common/Layout";
import {NavLink} from "react-router-dom";
import TicketList from "../../view/ticket/TicketList";
import {message} from 'antd';
import {ANTD_MESSAGE_MARGIN_TOP} from "../../Config";
import BreadCrumbs from "../../components/common/BreadCrumbs";

class Tickets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //breadcrumb
            locationPath: {
                base: 'Dashboard',
                basePath: '/',
                name: 'Tickets List',
                path: 'tickets',
            },
        }
    }

    componentDidMount() {
        let ticketNotFound = sessionStorage.getItem('error');
        if (ticketNotFound) {
            message.error({
                content: sessionStorage.getItem('error'),
                style: {
                    marginTop: ANTD_MESSAGE_MARGIN_TOP,
                }
            });
            sessionStorage.removeItem('error');
        }

        let successMsg = sessionStorage.getItem('success');
        if (successMsg) {
            message.success({
                content: sessionStorage.getItem('success'),
                style: {
                    marginTop: ANTD_MESSAGE_MARGIN_TOP,
                }
            });
            sessionStorage.removeItem('success');
        }
    }

    render() {
        let {locationPath} = this.state
        return (
            <Layout>

                <div className="ts-d-top-header mb-4">
                    <div className="ts-d-acc-name">
                        <span className="bi bi-list"/>
                        <span className="ts-d-acc-name-text text-uppercase"> All Ticket</span>
                    </div>
                </div>


                {/* Ticket Area*/}
                <div className="ts-d-tickets-area">


                    {/*Submenu Area*/}
                    <BreadCrumbs locationPath={locationPath}/>
                    {/*End Submenu Area*/}


                    {/*All Open Tickets*/}
                    <div className="ts-d-tickets-overview">
                        {/*Work Process*/}
                        <TicketList
                            query=""
                        />
                        {/* End Work Process*/}

                    </div>
                    {/*End All Open Tickets*/}


                </div>
                {/*End Ticket Area*/}


            </Layout>
        )
    }
}

export default Tickets;

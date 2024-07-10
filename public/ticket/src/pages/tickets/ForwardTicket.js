import React from "react";
import Layout from "../../components/common/Layout";
import ForwardTicketView from "../../view/ticket/ForwardTicketView";

class ForwardTicket extends React.Component {

    render() {
        return (
            <Layout>
                <ForwardTicketView />
            </Layout>
        )
    }

}

export default ForwardTicket;

import React from "react";
import Layout from "../../components/common/Layout";
import CreateTicketView from "../../view/ticket/CreateTicketView";

class CreateTicket extends React.Component {

    render() {
        return (
            <Layout>
                <CreateTicketView />
            </Layout>
        )
    }

}

export default CreateTicket;

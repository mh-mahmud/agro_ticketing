import React from "react";
import Layout from "../../components/common/Layout";
import EditTicketView from "../../view/ticket/EditTicketView";

class EditTicket extends React.Component {

    render() {
        return (
            <Layout>
                <EditTicketView />
            </Layout>
        )
    }

}

export default EditTicket;

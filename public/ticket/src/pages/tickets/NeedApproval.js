import React from "react";
import Layout from "../../components/common/Layout";
import NeedApprovalView from "../../view/ticket/NeedApprovalView";

class NeedApproval extends React.Component {

    render() {
        return (
            <Layout>
                <NeedApprovalView />
            </Layout>
        )
    }

}

export default NeedApproval;

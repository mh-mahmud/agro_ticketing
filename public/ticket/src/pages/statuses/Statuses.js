import React from 'react';
import StatusListView from "../../view/statuses/StatusListView";
import Layout from "../../components/common/Layout";

export default class Priorities extends React.Component {
    render() {
        return (
            <Layout>
                <StatusListView/>
            </Layout>
        )
    }
}
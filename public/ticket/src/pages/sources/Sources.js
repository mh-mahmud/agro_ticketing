import React from 'react';
import SourcesListView from "../../view/sources/SourcesListView";
import Layout from "../../components/common/Layout";

export default class Sources extends React.Component {
    render() {
        return (
            <Layout>
                <SourcesListView/>
            </Layout>
        )
    }
}
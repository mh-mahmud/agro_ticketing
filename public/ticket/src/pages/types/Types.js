import React from 'react';
import TypesListView from "../../view/types/TypesListView";
import Layout from "../../components/common/Layout";

export default class Types extends React.Component {
    render() {
        return (
            <Layout>
                <TypesListView/>
            </Layout>
        )
    }
}
import React from 'react';
import SubTypesListView from '../../view/subTypes/SubTypesListView';
import Layout from "../../components/common/Layout";

export default class SubTypes extends React.Component {
    render() {
        return (
            <Layout>
                <SubTypesListView/>
            </Layout>
        )
    }
}
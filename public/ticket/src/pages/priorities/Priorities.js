import React from 'react';
import PriorityListView from "../../view/priorities/PriorityListView";
import Layout from "../../components/common/Layout";

export default class Priorities extends React.Component {
    render() {
        return (
            <Layout>
                <PriorityListView/>
            </Layout>
        )
    }
}

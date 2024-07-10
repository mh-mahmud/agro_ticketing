import React from 'react';
import TagsListView from "../../view/tags/TagsListView";
import Layout from "../../components/common/Layout";

export default class Tags extends React.Component {
    render() {
        return (
            <Layout>
                <TagsListView/>
            </Layout>
        )
    }
}
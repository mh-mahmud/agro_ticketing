import React from 'react';
import QuestionListView from '../../view/questions/QuestionListView';
import Layout from "../../components/common/Layout";

export default class Questions extends React.Component {
    render() {
        return (
            <Layout>
                <QuestionListView/>
            </Layout>
        )
    }
}
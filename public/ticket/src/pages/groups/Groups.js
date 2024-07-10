import React, { Component } from 'react'
import GroupView from '../../view/groups/GroupView'
import Layout from "../../components/common/Layout";

export default class Groups extends Component {
    render() {
        return (
            <Layout>
                <GroupView></GroupView>
            </Layout>
        )
    }
}

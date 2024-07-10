import React from 'react'
import UserListView from '../../view/users/UserListView'
import Layout from "../../components/common/Layout";

export default class Users extends React.Component {
    render() {
        return (
            <Layout>
                <UserListView/>
            </Layout>
        )
    }
}

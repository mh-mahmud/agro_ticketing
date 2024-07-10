import React from 'react';
import HolidaysListView from '../../view/holidays/HolidaysListView';
import Layout from "../../components/common/Layout";

export default class Holiday extends React.Component {
    render() {
        return (
            <Layout>
                <HolidaysListView/>
            </Layout>
        )
    }
}
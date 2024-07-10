import React from 'react';
import CRMSkillRoleView from '../../view/crm-skill-role/CRMSkillRoleView';
import Layout from "../../components/common/Layout";

export default class CRMSkillRole extends React.Component {
    render() {
        return (
            <Layout>
                <CRMSkillRoleView/>
            </Layout>
        )
    }
}
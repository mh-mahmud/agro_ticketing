import React, {Component} from 'react'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Login from "../../pages/login/Login";
import NotFound from "../../pages/NotFound";
import NoPermission from '../../pages/NoPermission';
import Dashboard from "../../pages/dashboard/Dashboard";
import Profile from "../../pages/profile/Profile";
import CreateTicket from "../../pages/tickets/CreateTicket";
import ForwardTicket from "../../pages/tickets/ForwardTicket";
import Notification from "../../pages/notification/Notification";
import { ProtectedRoute } from "./ProtectedRoute";
import Users from '../../pages/users/Users';
import NonUsers from '../../pages/users/NonUsers';
import Roles from '../../pages/users/Roles';
import Priorities from '../../pages/priorities/Priorities';
import BusinessHours from '../../pages/business-hours/BusinessHours';
import CannedMessages from '../../pages/canned-messages/CannedMessages';
import Types from '../../pages/types/Types';
import SubTypes from '../../pages/types/SubTypes';
import Questions from '../../pages/questions/Questions';
import Tags from '../../pages/tags/Tags';
import Sources from '../../pages/sources/Sources';
import Holiday from '../../pages/holiday/Holiday';
import Statuses from '../../pages/statuses/Statuses';
import Tickets from "../../pages/tickets/Tickets";
import CloseTickets from "../../pages/tickets/CloseTickets";
import Groups from '../../pages/groups/Groups';
import ScrollToTop from "../common/ScrollToTop";
import EditTicket from "../../pages/tickets/EditTicket";
import Report from "../../pages/report/Report";
import Reply from "../../pages/tickets/Reply";
import NeedApproval from '../../pages/tickets/NeedApproval';
import Master from '../common/Master';
import SourceReport from "../../pages/report/source-report/SourceReport";
import TypeReport from "../../pages/report/type-report/TypeReport";
import GroupReport from "../../pages/report/group-report/GroupReport";
import StatusReport from "../../pages/report/status-report/StatusReport";
import CRMSkillRoleView from '../../view/crm-skill-role/CRMSkillRoleView';
import {ROUTE_BASENAME} from "../../Config";

export default class CommonRoute extends Component {

    render() {
        return (
            <Router basename={ROUTE_BASENAME}>
                <ScrollToTop/>
                <Master>
                    <Switch>

                        {/* Protected Route */}
                        <ProtectedRoute exact path="/dashboard"             component={Dashboard} />
                        <ProtectedRoute exact path="/profile"               component={Profile} />

                        {/* Ticket */}
                        <ProtectedRoute exact path="/edit-ticket/:id"       component={EditTicket} />
                        <ProtectedRoute exact path="/create-ticket"         component={CreateTicket} />
                        <ProtectedRoute exact path="/ticket-forward/:id"    component={ForwardTicket} />
                        <ProtectedRoute exact path="/close-ticket"          component={CloseTickets} />
                        <ProtectedRoute exact path="/tickets"               component={Tickets} />
                        <ProtectedRoute exact path="/tickets/reply/:id"     component={Reply} />
                        <ProtectedRoute exact path="/ticket/need-approval"  component={NeedApproval} />
                        {/* End Ticket */}

                        <ProtectedRoute exact path="/notification"          component={Notification} />

                        {/*Report*/}
                        <ProtectedRoute exact path="/report"                component={Report} />
                        <ProtectedRoute exact path="/source-report"         component={SourceReport} />
                        <ProtectedRoute exact path="/type-report"           component={TypeReport} />
                        <ProtectedRoute exact path="/group-report"          component={GroupReport} />
                        <ProtectedRoute exact path="/status-report"         component={StatusReport} />
                        <ProtectedRoute exact path="/crm-skill-role"        component={CRMSkillRoleView} />
                        {/*End Report*/}

                        <ProtectedRoute exact path="/users"             component={Users} />
                        <ProtectedRoute exact path="/non-users"          component={NonUsers} />
                        <ProtectedRoute exact path="/roles"             component={Roles} />

                        <ProtectedRoute exact path="/priorities"        component={Priorities} />
                        <ProtectedRoute exact path="/statuses"          component={Statuses} />
                        <ProtectedRoute exact path="/groups"            component={Groups} />
                        <ProtectedRoute exact path="/business-hours"    component={BusinessHours} />
                        <ProtectedRoute exact path="/holiday"           component={Holiday} />
                        <ProtectedRoute exact path="/canned-messages"   component={CannedMessages} />
                        <ProtectedRoute exact path="/types"             component={Types} />
                        <ProtectedRoute exact path="/sub-types"         component={SubTypes} />
                        <ProtectedRoute exact path="/questions"         component={Questions} />
                        <ProtectedRoute exact path="/sources"           component={Sources} />
                        <ProtectedRoute exact path="/tags"              component={Tags} />

                        <ProtectedRoute exact path="/forbidden"         component={NoPermission} />
                        {/* End Protected Route */}

                        <Route path="*">
                            <NotFound/>
                        </Route>

                    </Switch>
                </Master>
            </Router>
        )
    }

}



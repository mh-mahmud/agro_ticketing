import React, {Component} from 'react'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import CreateTicketCrm from '../../pages/crm-api/CreateTicketCrm';
import ScrollToTop from "../common/ScrollToTop";
import {ROUTE_BASENAME} from "../../Config";
import Login from "../../pages/login/Login";
import NotFound from "../../pages/NotFound";
import TicketReplyCrm from '../../pages/crm-api/TicketReplyCrm';

export default class CrmRoute extends Component {

    render() {
        return (
            <Router basename={ROUTE_BASENAME}>
                <ScrollToTop/>
                <Switch>

                    <Route exact path='/'>
                        <Login/>
                    </Route>
                    <Route exact path="/crm/crm-create-ticket/:token/:cli"  component={CreateTicketCrm}></Route>
                    <Route exact path="/crm/crm-ticket-reply/:id/:token"    component={TicketReplyCrm}></Route>
                    
                    <Route path="*">
                        <NotFound/>
                    </Route>
                    
                </Switch>
            </Router>
        )
    }

}



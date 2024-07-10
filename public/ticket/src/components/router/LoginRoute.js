import React, {Component} from 'react'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Login from "../../pages/login/Login";
import ScrollToTop from "../common/ScrollToTop";
import {ROUTE_BASENAME} from "../../Config";
import NotFound from "../../pages/NotFound";

export default class LoginRoute extends Component {

    render() {
        return (
            <Router basename={ROUTE_BASENAME}>
                <ScrollToTop/>
                <Switch>

                    <Route exact path='/'>
                        <Login/>
                    </Route>

                    <Route path="*">
                        <NotFound/>
                    </Route>
                    {/* <ProtectedRoute path="/dashboard"             component={CommonRoute} /> */}

                </Switch>
            </Router>
        )
    }

}
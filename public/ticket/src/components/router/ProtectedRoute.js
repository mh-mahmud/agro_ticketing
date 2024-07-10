import React from "react";
import { Route, Redirect } from "react-router-dom";
import Auth from "../../services/Auth";
import {ROUTE_BASENAME} from "../../Config";

export const ProtectedRoute = ({component: Component, ...rest}) => {

  return (
    <Route {...rest} render={props => {
        if( (new Auth()).isAuthenticated() ) {
          return ( <Component {...props} /> );
        }else{
          // Redirect to login page
          window.location.href = "/" + ROUTE_BASENAME;
          // return ( <Redirect to={{pathname: "/", state: { from: props.location}}} /> );
        }
      }}
    />
  )

}

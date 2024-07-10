import React, { Component } from 'react'
import './App.css';
import './assets/css/bootstrap-icons.css';
import CommonRoute from "./components/router/CommonRoute";
import LoginRoute from './components/router/LoginRoute';
import Auth from './services/Auth';
import CrmRoute from './components/router/CrmRoute';

export default class App extends Component {

  getRendered(){

      let is_crm_req = window.location.href.includes("/crm/")/* Check CRM route */;
      if( (new Auth()).isAuthenticated() && !(new Auth()).isApiUser() && !is_crm_req ){
        return <>
          <CommonRoute/>
        </>
      }else if((new Auth()).isApiUser() || is_crm_req){
        if(localStorage.getItem('user_info')) {
          localStorage.clear();
        }
        return <>
          <CrmRoute/>
        </>
      }else{
        return <>
          <LoginRoute/>
        </>
      }

  }

  render() {
    return (
      <div className="App">
        {this.getRendered()}
      </div>
    )
  }
}

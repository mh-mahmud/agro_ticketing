import React, { Component } from 'react'
import TicketForm from '../../view/ticket/TicketForm'
import Common from './Service/Common'

export default class CreateTicketCrm extends Component {

  componentDidMount(){
    (new Common).setTokenAndPermissionsIfNotExist(this.props.match.params.token);
  }

  render() {
    return (
      <>
        <TicketForm/>
      </>
    )
  }
}

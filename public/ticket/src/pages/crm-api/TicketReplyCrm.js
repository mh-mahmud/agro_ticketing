import React, { Component } from 'react';
import Common from './Service/Common';
import ReplyView from '../../view/ticket/ReplyView';

export default class TicketReplyCrm extends Component {

  render() {
    // Set token
    (new Common).setTokenAndPermissionsIfNotExist(this.props.match.params.token);
    return (
      <>
        <ReplyView/>
      </>
    )
  }
}

import React, { Component } from 'react'
import Helper from '../../services/Helper';

export default class View extends Component {
    
    constructor(props){
        super(props)

        this.state = {

            group: {},
            groups: [],
            parent_source: ''
        }

        this.Helper = new Helper();
        this.state.group = props.targetedGroup
        this.state.groups = props.groups

    }

    componentDidMount() {
        let item = this.state.groups.filter((item)=> item.groupId === Number(this.state.group.parent_id))
        this.setState({parent_source : item[0]})
    }
    
    render() {
        return (
            <>
                <table className="table table-hover">
                    <tbody>
                    <tr>
                        <th width="180px">Group Name</th>
                        <td>:</td>
                        <td>{this.props.targetedGroup.name}</td>
                    </tr>
                    {this.state.parent_source != null ?
                        <tr>
                            <th>Parent</th>
                            <td>:</td>
                            <td>{this.state.parent_source.name}</td>
                        </tr>
                        :
                        ''
                    }
                    <tr>
                        <th>Description</th>
                        <td>:</td>
                        <td>{this.props.targetedGroup.description}</td>
                    </tr>
                    <tr>
                        <th>Need Ticket Approval</th>
                        <td>:</td>
                        <td>{this.props.targetedGroup.need_ticket_approval == '1' ? 'On' : 'Off'}</td>
                    </tr>
                    </tbody>
                </table>

                <hr/>
                <h6 className="mb-3"><u>ASSIGNED AGENTS</u></h6>

                <table className="table table-hover">
                    <tbody>
                        {
                            this.props.targetedGroup.agents.map((agent)=>{
                                return <tr>
                                            <th width="20px">
                                                <i className="bi bi-person-circle"></i>
                                                {/* <img src={agent.media.url} alt="Girl in a jacket" width="500" height="600"/> */}
                                            </th>
                                            <td>{this.Helper.getFullName(agent.user_details) + ' ' + agent.user_details.last_name}<br/>{agent.user_details.email}</td>
                                        </tr>
                            })
                        }
                    </tbody>
                </table>
            </>
        )
    }
}

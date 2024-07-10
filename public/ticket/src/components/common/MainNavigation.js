import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import {Menu} from 'antd';
import Auth from '../../services/Auth';
import {API_URL, NOTIFICATION_CHECK_INTERVAL} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';

const rootSubmenuKeys = ['sub1', 'sub2', 'sub3'];
export default class MainNavigation extends Component {

    constructor() {
        super();
        this.state = {
            newNotification: 0,
            openKeys: []
        }
        this.auth = new Auth();
        this.setNotificationToSeen = this.setNotificationToSeen.bind(this);
        this.onOpenChange = this.onOpenChange.bind(this);
    }

    onOpenChange = (keys) => {

        const latestOpenKey = keys.find(
            (key) => this.state.openKeys.indexOf(key) === -1
        );
        if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            this.setState({openKeys: keys});
        } else {
            this.setState({openKeys: latestOpenKey ? [latestOpenKey] : []});
        }

    };

    componentDidMount() {
        this.getAndSetNewNotificationCount();

        this.interval = setInterval(() => {
            this.getAndSetNewNotificationCount();
        }, NOTIFICATION_CHECK_INTERVAL);

        if (this.state.newNotification) {
            this.setNotificationToSeen();
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async getAndSetNewNotificationCount() {
        let notificationCount = await (new Api()).call('GET', API_URL + '/notification/newNotificationCount', [], (new Token()).get());
        this.setState({newNotification: notificationCount.data.data});
    }

    async setNotificationToSeen() {
        await (new Api()).call('GET', API_URL + '/notification/setNotificationToSeen', [], (new Token()).get());
        this.setState({newNotification: 0});
    }

    render() {
        const {openKeys} = this.state;
        return <Menu mode="inline" onOpenChange={this.onOpenChange} openKeys={openKeys}>
            <Menu.Item key="1">
                <NavLink to="/dashboard">
                    {" "}
                    <i className="bi bi-house-door"/>
                    Dashboard
                </NavLink>
            </Menu.Item>

            <Menu.Item key="2">
                <NavLink to="/profile">
                    {" "}
                    <i className="bi bi-person"/>
                    Profile
                </NavLink>
            </Menu.Item>

            <Menu.SubMenu
                key="sub1"
                icon={<i className="bi bi-pip"/>}
                title="Tickets"
                style={{fontWeight: 600}}
                role="menuitem"
            >

                <Menu.Item key="30">
                    <NavLink to="/tickets">
                        <i className="bi bi-window-stack"/>
                        All Tickets
                    </NavLink>
                </Menu.Item>

                {
                    this.auth.isPermitted('ticket-create') ?
                        <Menu.Item key="31">
                            <NavLink to="/create-ticket">
                                <i className="bi bi-pencil-square"/>
                                Create Ticket
                            </NavLink>
                        </Menu.Item>
                        : null
                }

                {
                    this.auth.isPermitted('ticket-edit') ?
                        <Menu.Item key="32">
                            <NavLink to="/ticket/need-approval">
                                <i className="bi bi-clipboard-check"/>
                                Need Approval
                            </NavLink>
                        </Menu.Item>
                        : null
                }

            </Menu.SubMenu>

            <Menu.Item key="4">
                <NavLink to="/notification" onClick={this.state.newNotification ? this.setNotificationToSeen : null}>
                    {" "}
                    <i className="bi bi-bell"/>
                    Notification
                    {
                        this.state.newNotification ?
                            <span className="ts-d-notification-no">{this.state.newNotification}</span>
                            : null
                    }
                </NavLink>
            </Menu.Item>

            <Menu.SubMenu
                key="sub2"
                icon={<i className="bi bi-bar-chart-line"/>}
                title="Report"
                style={{fontWeight: 600}}
            >

                {/* <Menu.Item key="18">
                    <NavLink to="/report">
                        {" "}
                        <i className="bi bi-journals"/>
                        Report Overview
                    </NavLink>
                </Menu.Item> */}

                {this.auth.isPermitted("source-report") ?
                    <Menu.Item key="19">
                        <NavLink to="/source-report">
                            {" "}
                            <i className="bi bi-receipt"/>
                            Source Report
                        </NavLink>
                    </Menu.Item>
                    : null
                }

                {this.auth.isPermitted("type-report") ?
                    <Menu.Item key="20">
                        <NavLink to="/type-report">
                            {" "}
                            <i className="bi bi-receipt"/>
                           Type Report
                        </NavLink>
                    </Menu.Item>
                    : null
                }

                {this.auth.isPermitted("group-report") ?
                    <Menu.Item key="21">
                        <NavLink to="/group-report">
                            {" "}
                            <i className="bi bi-receipt"/>
                           Group Report
                        </NavLink>
                    </Menu.Item>
                    : null
                }

                {this.auth.isPermitted("status-report") ?
                    <Menu.Item key="22">
                        <NavLink to="/status-report">
                            {" "}
                            <i className="bi bi-receipt"/>
                           Status Report
                        </NavLink>
                    </Menu.Item>
                    : null
                }

            </Menu.SubMenu>

            <Menu.SubMenu
                key="sub3"
                icon={<i className="bi bi-gear"/>}
                title="Settings"
                style={{fontWeight: 600}}
            >
                {this.auth.isPermitted("user-list") ?
                    <Menu.Item key="6">
                        <NavLink to="/users">
                            {" "}
                            <i className="bi bi-people-fill"/>
                            Users
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }

                {/* {this.auth.isPermitted("user-list") ?
                    <Menu.Item key="19">
                        <NavLink to="/non-users">
                            {" "}
                            <i className="bi bi-people-fill"/>
                            Customers
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                } */}

                {this.auth.isPermitted("role-list") ?
                    <Menu.Item key="7">
                        <NavLink to="/roles">
                            {" "}
                            <i className="bi bi-ui-checks-grid"/>
                            Roles
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }

                {this.auth.isPermitted("priority-list") ?
                    <Menu.Item key="8">
                        <NavLink to="/priorities">
                            {" "}
                            <i className="bi bi-exclude"/>
                            Priority
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }

                {this.auth.isPermitted("status-list") ?
                    <Menu.Item key="9">
                        <NavLink to="/statuses">
                            {" "}
                            <i className="bi bi-subtract"/>
                            Status
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }

                {this.auth.isPermitted("group-list") ?
                    <Menu.Item key="10">
                        <NavLink to="/groups">
                            {" "}
                            <i className="bi bi-collection-fill"/>
                            Groups
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }
                {this.auth.isPermitted("type-list") ?
                    <Menu.Item key="11">
                        <NavLink to="/types">
                            {" "}
                            <i className="bi bi-stickies-fill"/>
                            Category
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }
                {this.auth.isPermitted("type-list") ?
                    <Menu.Item key="12">
                        <NavLink to="/sub-types">
                            {" "}
                            <i className="bi bi-stickies-fill"/>
                            Sub Category
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }
                {this.auth.isPermitted("question-list") ?
                    <Menu.Item key="18">
                        <NavLink to="/questions">
                            {" "}
                            <i className="bi bi-stickies-fill"/>
                            Questions
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }
                {this.auth.isPermitted("source-list") ?
                    <Menu.Item key="13">
                        <NavLink to="/sources">
                            {" "}
                            <i className="bi bi-square-fill"/>
                            Source
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }

                {this.auth.isPermitted("business-hour-list") ?
                    <Menu.Item key="14">
                        <NavLink to="/business-hours">
                            {" "}
                            <i className="bi bi-calendar-week"/>
                            Business Hours
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }

                {this.auth.isPermitted("holiday-list") ?
                    <Menu.Item key="19">
                        <NavLink to="/holiday">
                            {" "}
                            <i className="bi bi-calendar-week"/>
                            Holiday
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }

                {this.auth.isPermitted("canned-message-list") ?
                    <Menu.Item key="15">
                        <NavLink to="/canned-messages">
                            {" "}
                            <i className="bi bi-envelope-plus-fill"/>
                            Canned Messages
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                }

                {/* {this.auth.isPermitted("tag-list") ?
                    <Menu.Item key="16">
                        <NavLink to="/tags">
                            {" "}
                            <i className="bi bi-tags"/>
                            Tags
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                } */}
                
                {/* {this.auth.isPermitted("crm-skill-role-list") ?
                    <Menu.Item key="17">
                        <NavLink to="/crm-skill-role">
                            {" "}
                            <i className="bi bi-square-fill"/>
                            CRM Skill Role
                        </NavLink>
                    </Menu.Item>
                    :
                    ""
                } */}
            </Menu.SubMenu>
        </Menu>;
    }
}

import React from "react";
import ICON_NOTIFICATION from "../../assets/images/icon-notification.svg";
import ICON_DELETE from "../../assets/images/delete.svg";

class NotificationSlot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notificationList: [
                {
                    'title': 'All Notification',
                    'desc': 'Show Your ALl Notification',
                    'type': 'general',
                    'notification_no': 99,
                },
                {
                    'title': 'Software Dept',
                    'desc': 'Department Individual Notification',
                    'type': 'general',
                    'notification_no': 94,
                },
                {
                    'title': 'NOC Dept.',
                    'desc': 'Department Individual Notification',
                    'type': 'general',
                    'notification_no': 4
                },
                {
                    'title': 'Marketing Dept.',
                    'desc': 'Department Individual Notification',
                    'type': 'general',
                    'notification_no': 4
                }, {
                    'title': 'Account Dept.',
                    'desc': 'Department Individual Notification',
                    'type': 'general',
                    'notification_no': 4
                },
                {
                    'title': 'Management',
                    'desc': 'Department Individual Notification',
                    'type': 'general',
                    'notification_no': 4
                },

                {
                    'title': 'Delete',
                    'desc': 'Delete Notification',
                    'type': 'delete',
                    'notification_no': 4
                }
            ]
        }
    }

    render() {
        const {notificationList} = this.state;
        return (
            <>
                <div className="col-lg-3 ts-d-notification-slot-main flex-one">

                    <div className="ts-d-notification-header">
                        <p className="text-capitalize">Notification Slot</p>
                        <i className="bi bi-three-dots-vertical"/>
                    </div>

                    <div className="ts-d-s-notification-area">
                        {notificationList.map((item, i) => {
                            return (
                                <div className="ts-d-s-notification">
                                    <img src={item.type !== 'delete' ? ICON_NOTIFICATION : ICON_DELETE} alt=""/>
                                    <div className="ts-d-s-notification-text">
                                        <h5 className="text-capitalize">{item.title}</h5>
                                        <small className="text-capitalize">{item.desc}</small>
                                    </div>
                                    {item.type !== 'general' ? '' : item.notification_no ?
                                        <span className="ts-d-s-notification-no">{item.notification_no}</span> : ''}
                                </div>
                            )
                        })}

                    </div>
                </div>
            </>
        )
    }
}

export default NotificationSlot;

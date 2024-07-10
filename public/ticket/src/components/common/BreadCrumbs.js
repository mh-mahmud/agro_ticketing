import React from 'react'
import {NavLink} from "react-router-dom";

export default class BreadCrumbs extends React.Component{

    render() {
        return(
            <>
                <div className="col-md-6">
                    <div className="ts-d-submenu-area">
                        <div className="ts-d-left-toolbar ts-d-top-toolbar">
                            <ul>
                                <li>
                                    <NavLink to={this.props.locationPath.basePath}><i className="bi bi-house-fill"> </i>{this.props.locationPath.base}</NavLink>
                                </li>
                                <li>
                                    <NavLink to={this.props.locationPath.path}><i className="bi bi-ui-checks"> </i>{this.props.locationPath.name}</NavLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </>
        )
    }

}

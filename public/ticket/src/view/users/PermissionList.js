import React, { Component } from 'react'
import Checkbox from '../../components/common/CheckBox';

export default class PermissionList extends Component {
    render() {
        return (
            <div className="ts-d-role-list">
                {this.props.permissionGroupData.map(permissionGroup => (
                    <ul key={permissionGroup.id}>
                        <li key={permissionGroup.id}>
                            <h6><b>{permissionGroup.name}</b></h6>
                            <span>
                                <Checkbox
                                    handleCheckChieldElement={
                                        (this.props.actionType != 'view') ?
                                            (e) => this.props.handleAllChecked(e, permissionGroup)
                                            :
                                            () => {}
                                    }
                                    isChecked={permissionGroup.isAllPemission}
                                    disabled={
                                        (this.props.actionType != 'view') ?
                                            permissionGroup.isAllRoleBasePermission == undefined ? false : permissionGroup.isAllRoleBasePermission == true ? true : false
                                        :
                                            true
                                    }
                                />
                            {" "}
                            <label>Check/Uncheck All</label>
                            </span>
                        </li>

                        <li key={permissionGroup.id + 1}>
                            {permissionGroup.permissions.map(permission => (

                                <span className="border-0" key={permission.id}>
                                    <Checkbox
                                        handleCheckChieldElement={
                                            (this.props.actionType != 'view') ?
                                                () => this.props.handlePermissionOnChange(permission.id, permission.permission_group_id)
                                                :
                                                () => {}
                                        }
                                        key={permission.id}
                                        isChecked={permission.isPermissionGiven}
                                        value={permission.name}
                                        disabled={
                                            (this.props.actionType != 'view') ?
                                                permission.isRoleBasePermission == undefined ? false : (permission.isRoleBasePermission == true ? true : false)
                                            :
                                                true
                                        }
                                    />
                                {" "}<label> {permission.name}</label>
                                </span>
                            ))}
                        </li>
                    </ul>
                ))}
            </div>
        )
    }
}

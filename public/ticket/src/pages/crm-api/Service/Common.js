import React, { Component } from 'react'
import Api from '../../../services/Api';
import { API_URL } from '../../../Config';

export default class Common extends Component {
  
    setTokenAndPermissionsIfNotExist(token){
        if (token != undefined) {
            localStorage.setItem('token', token);
            this.setPermissionsIfNotExist(token);
        }
    }

    async setPermissionsIfNotExist(token){

        let user_info = await (new Api()).call('GET', API_URL + '/getUserInfo', [], token);
        if(user_info.status == 200) {
            localStorage.setItem('permissions', JSON.stringify( this.getPermissions(user_info.data.userInfo) ));
        }

    }

    getPermissions(user_info){
        let permissions = [];
        user_info.roles.forEach((item, index) => {
            permissions = permissions.concat(item.permissions);
        });
        return permissions.concat(user_info.permissions); // Concate Special Permissions
    }
    
}

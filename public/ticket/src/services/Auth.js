export default class Auth{

    isAuthenticated(){
        // Check if token exist or not
        if(localStorage.getItem('token')) {
            return true;
        } else {
            return false;
        }
    }

    isApiUser(){
        if(!localStorage.getItem('user_info')) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * Check permission
     * @param {String} permissionSlug 
     * @returns {boolean}
     */
     isPermitted(permissionSlug){
        let permissions = localStorage.getItem('permissions') ? JSON.parse(localStorage.getItem('permissions')) : [];
        if(permissions.find((permissionObj)=>permissionObj.slug === permissionSlug)){
            return true;
        }
        return false;
    }

}
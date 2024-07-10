export default class Helper{

    /**
     * 
     * @param {object} objects 
     * @param {string} columnName 
     * @returns {string}
     */
    objectsColumnToCsv(objects, columnName){
        let csv = null;
        objects.map((object)=>{
            if(csv){
                csv += ", " + object[columnName];
            }else{
                csv = object[columnName];
            }
            return 1;
        })
        return csv;
    }

    /**
     * 
     * @param {array} errors 
     * @returns {string}
     */
    arrayToErrorMessage(errors){
        let message = null;
        errors.map((error)=>{
            if(!message){
                message = error;
            }else{
                message += " | " + error;
            }
        });
        return message;
    }

    /**
     * @param {object} User 
     * @returns {string}
     */
    getFullName(user){
        return user.first_name + ' ' + (user.middle_name ?? '') + ' ' + (user.last_name ?? '');
    }

    /**
     * 
     * @param {String} source 
     * @param {int} size 
     * @returns source
     */
    truncateWithDot(source, size) {
        return source.length > size ? source.slice(0, size - 1) + "…" : source;
    }

}
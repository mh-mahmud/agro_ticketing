import Axios from "axios";

export default class Api{

    async call(method, url, data = [], token = ""){
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
        try {
            const response = await Axios({

                method: method,
                url: url,
                data: data,
                headers: headers
        
            });
            if(response.data.status_code !== 403){
                return response;
            }else{
                //Forbidden
                window.location.href = "/ticket/forbidden";
                return 1;
            }
        } catch (e) {

            return null;

        }
    }
    
}
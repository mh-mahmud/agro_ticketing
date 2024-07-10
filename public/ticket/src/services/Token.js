export default class Token{

    // Save token
    store(authToken){
        localStorage.setItem('token', authToken);
    }

    // Get stored token
    get(){
        return localStorage.getItem('token');
    }

}
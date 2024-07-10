import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import Api from '../../services/Api';
import Token from '../../services/Token';
import Auth from "../../services/Auth";
// Images
import LOGO from '../../assets/images/logo.svg';
import USER from '../../assets/images/user.svg';
import LOCK from '../../assets/images/lock.svg';
import {Link} from 'react-router-dom';
import {API_URL} from "../../Config";
import Common from '../../pages/crm-api/Service/Common';
import {Button} from 'antd';

class LoginView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loginData: {
                username: '',
                password: ''
            },
            isLoggedin: false,
            errorMessage: '',
            hidden: true,
            submitLoading: false,
        };
        // If authenticated then go to dashboad directly
        if ((new Auth()).isAuthenticated() && !(new Auth()).isApiUser()){
            this.redirectToDashboard();
        }
        this.toggleShow = this.toggleShow.bind(this);
    }

    onChangehandler = (e) => {
        const {loginData} = this.state;
        loginData[e.target.name] = e.target.value;
        this.setState({loginData});
    }

    redirectToDashboard() {
        window.location.href = "/ticket/dashboard";
    }

    handleSubmit = async (e) => {

        e.preventDefault();
        this.setState({submitLoading: true});
        const response = await (new Api()).call('POST', API_URL + '/login', this.state.loginData);
        if (Number(response.data.status) === 200 && response.data.token) {

            this.setState({submitLoading: false});
            (new Token()).store(response.data.token);
            localStorage.setItem('user_info', JSON.stringify(response.data.user_info));
            let permissions = (new Common()).getPermissions(response.data.user_info);
            localStorage.setItem('permissions', JSON.stringify(permissions));
            this.redirectToDashboard();

        }else{
            this.setState({errorMessage: response.data.messages});
        }
        this.setState({submitLoading: false});

    }

    toggleShow() {
        this.setState({hidden: !this.state.hidden});
    }

    componentDidMount() {
        if (this.props.password) {
            this.setState({password: this.props.password});
        }
    }

    render() {
        return (

            <div className="ts-login-page-area">
                <div className="ts-login-page-main">

                    <div className="ts-login-logo mb-2 text-center">
                        <Link to="/"><img className="img-fluid" src={LOGO} alt=""/></Link>
                        <p className="ts-login-title text-center text-uppercase">
                            Ticket Management System
                        </p>
                    </div>

                    <div className="ts-login-card-area">
                        {this.state.errorMessage ?
                            <div className="alert alert-danger" role="alert"> {this.state.errorMessage} </div> : null}
                        {this.state.isLoggedin ? <div className="alert alert-success" role="alert"> Login Success.
                            (Redirecting...) </div> : null}

                        <div className="ts-login-card-body my-5">
                            <form>

                                <label className="user-input-wrp">
                                    <input type="text" className="inputText" name="username"
                                           value={this.state.loginData.username} onChange={this.onChangehandler}
                                           required/>
                                    <span className="floating-label">User Name</span>
                                    <img className="ts-user-icon" src={USER} alt=""/>
                                </label>

                                <label className="user-input-wrp">
                                    <input type={this.state.hidden ? 'password' : 'text'} className="inputText"
                                           name="password" value={this.state.loginData.password}
                                           onChange={this.onChangehandler} required/>
                                    <span className="floating-label">Password</span>

                                    <img className="ts-lock-icon" src={LOCK} alt=""/>
                                    <i onClick={this.toggleShow}
                                       className={this.state.hidden ? 'bi bi-eye-slash ts-eye-icon' : ' ts-eye-icon bi bi-eye'}> </i>
                                </label>

                                {/* <button className="ts-login-btn" type="submit">Login</button> */}
                                <Button
                                    className   = "ts-login-btn" 
                                    type        = "submit" 
                                    loading     = {this.state.submitLoading}
                                    disabled    = {this.state.submitLoading}
                                    onClick     = {this.handleSubmit}
                                >
                                    Login
                                </Button>

                            </form>

                        </div>

                        <div className="ts-login-card-footer text-center">
                            <small>Powered by gPlex</small>
                        </div>

                    </div>

                    <div className="ts-login-page-copyright">
                        <p>Copyright &copy; Genusys Inc. All rights reserved</p>
                    </div>

                    <div className="ts-login-bottom-image ocean">
                        <div className="wave"></div>
                        <div className="wave"></div>
                    </div>
                </div>
            </div>

        )
    }
}

export default withRouter(LoginView);

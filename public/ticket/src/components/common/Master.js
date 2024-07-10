import React from "react";
import {Menu, Dropdown, Drawer} from 'antd';
import USER_PIC from '../../assets/images/admin-user.svg';
import LOGO from '../../assets/images/logo.svg';
import HAMBURGER from '../../assets/images/menu.svg';
import PROFILE_USER from '../../assets/images/profile-user.svg';
import Auth from "../../services/Auth";
import Helper from '../../services/Helper';
import {withRouter} from "react-router-dom";
import MainNavigation from "./MainNavigation";
import {API_URL} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import NO_PHOTO from "../../assets/images/no-photo.png";

// import Layout from "./Layout";

class Master extends React.Component {

    constructor(props) {
        super(props);
        this.auth = new Auth();
        this.state = {
            visible: false,
            user_info: null,
            isAllStateReady: false,
            hour: null
        }
        this.logOut = this.logOut.bind(this);
        this.Helper = new Helper();
        this.Menu = (
            <Menu>
                <Menu.Item key="0">
                    <a className="text-decoration-none" onClick={this.logOut}>Logout</a>
                </Menu.Item>
            </Menu>
        );
    }

    componentDidMount() {
        this.setState({user_info: JSON.parse(localStorage.getItem("user_info"))}, () => {
            this.setState({isAllStateReady: true});
        });
        this.getHour()
    }

    getHour = () => {
        const date = new Date();
        const hour = date.getHours()
        this.setState({
            hour
        })
    }
    showDrawer = () => {
        this.setState({
            visible: true,
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    async logOut() {
        await (new Api()).call('POST', API_URL + '/user/logout', [], (new Token()).get());
        localStorage.clear();
        // this.props.history.push('/');
        window.location.href = "/ticket";
    }

    render() {
        return (

            this.state.isAllStateReady ?
                <div className={this.props.className}>
                    { 
                        (new Auth()).isAuthenticated() && this.state.user_info ?
                            <div className="ts-d-header-area fixed-top">
                                <div className="container-fluid">
                                    <div className="ts-d-header-main">

                                        <div className="ts-ds-logo">
                                            <a href="/">
                                                <img src={LOGO} alt=""/>
                                            </a>
                                        </div>

                                        <div className="ts-user">
                                            <Dropdown overlay={this.Menu} trigger={['click']}>
                                                <p className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                                    <span
                                                        className="ts-user-greetings">
                                                        {this.state.hour < 12 ? "Good Morning!" : this.state.hour >= 12 && this.state.hour < 17 ? "Good Afternoon!" : "Good Evening!"}
                                                    </span>
                                                    <span
                                                        className="ts-user-name">{this.Helper.getFullName(this.state.user_info)}</span>
                                                    <img className="ts-user-pic" src={this.state.user_info.media ? this.state.user_info.media.url : NO_PHOTO} alt=""/>
                                                </p>
                                            </Dropdown>

                                            <div className="ts-d-hamburger" onClick={this.showDrawer}>
                                                <img src={HAMBURGER} alt=""/>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            : null

                    }

                    <div className="ts-d-main-area">
                        {
                            (new Auth()).isAuthenticated() && this.state.user_info ?
                                <>
                                    <div className="ts-d-sidebar-area">

                                        <div className="ts-d-user-avatar">
                                            <img src={this.state.user_info.media ? this.state.user_info.media.url : NO_PHOTO} alt=""/>
                                            <span className="ts-d-user-avatar-name">
                                                gPlex Ticketing Systems
                                            </span>
                                        </div>

                                        <div className="ts-d-sidebar-navigation mt-5">
                                            <h6>NAVIGATION</h6>
                                            <MainNavigation/>
                                        </div>

                                    </div>
                                    {/*For Mobile View Only*/}
                                    <div className="ts-d-drawer-menu ts-d-sidebar-navigation">
                                        <Drawer placement="right"
                                                closable={true}
                                                onClose={this.onClose}
                                                visible={this.state.visible}
                                                getContainer={false}
                                                zIndex="3000"
                                                style={{position: 'fixed'}}>
                                            <MainNavigation/>
                                        </Drawer>
                                    </div>
                                </>
                                : null
                        }

                        <div className="ts-d-common-area">
                            {this.props.children}
                        </div>
                    </div>

                    <div className="ts-footer-main-area">
                        <div className="container-fluid p-0">
                            <div className="ts-main-footer text-center">
                                <small className="">Powered By <strong>g</strong><span>Plex</span></small>
                            </div>
                        </div>
                    </div>

                </div>
                : null

        )
    }

}

export default withRouter(Master);

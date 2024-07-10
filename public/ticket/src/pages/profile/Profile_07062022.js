import React from "react";
import Layout from "../../components/common/Layout";
import Api from '../../services/Api';
import { API_URL, ANTD_MESSAGE_MARGIN_TOP } from "../../Config";
import Token from '../../services/Token';
import { Modal, Button, message, Spin, notification,Alert} from 'antd';
import Helper from '../../services/Helper';
import Joi from 'joi';
import Auth from "../../services/Auth";
import NO_PHOTO from "../../assets/images/no-photo.png";

class Profile extends React.Component {
    constructor() {
        super();
        this.state = {

            user_info: JSON.parse(localStorage.getItem("user_info")),
            isModalVisible: false,
            submitLoading: false,
            isAllStateReady: false,
            spinning : false,
            userStatisticsData: '',
            userData: '',
            validationError: {
                first_name: '',
                middle_name: '',
                last_name: '',
                address: '',
                email: '',
                mobile: '',
                username: '',
            },
        }
        this.getUserStatisticsData = this.getUserStatisticsData.bind(this);
        this.getUserData = this.getUserData.bind(this);
        this.showModal = this.showModal.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.Auth = new Auth();
        this.Helper = new Helper();
    }
    async componentDidMount() {
        this.getUserStatisticsData();
        this.getUserData();
    }

    async getUserStatisticsData(pageNumber = 1) {
        const response = await (new Api()).call('GET', API_URL + '/report', '', (new Token()).get());
        if (response && response.data.status_code === 200) {
            this.setState({ userStatisticsData: response.data.reportData });

        }
    }

    async getUserData(pageNumber = 1) {
        const response = await (new Api()).call('GET', API_URL + '/user/showOwnData/' + this.state.user_info.id, [], (new Token()).get());
        if (response) {
            this.setState({ userData: response.data.user_info }, ()=>{
                this.setState({isAllStateReady: true});
            });
        }
    }

    showModal() {
        this.setState({ isModalVisible: true });
    };

    handleOk() {

        this.setState({ isModalVisible: false });
    };

    handleCancel() {

        this.setState({ isModalVisible: false });
    };

    onChangeHandler = (event, key) => {
        const { userData } = this.state;
        userData[event.target.name] = event.target.value;
        this.setState({ userData });
    }

    resetModal() {
        this.setState({ isModalVisible: false });
        this.setState({ submitLoading: false });
        this.setState({ errors: null });
    }


    validateUserData() {
        let rules = {
            first_name: Joi.string().min(3).label('First Name').required(),
            middle_name: Joi.string().allow('', null).min(3).label('Middle Name'),
            address: Joi.string().allow('', null).label('Address'),
            last_name: Joi.string().min(3).label('Last Name').required(),
            email: Joi.string().label('Email').email({ minDomainSegments: 2, tlds: {} }),
            mobile: Joi.string().min(3).label('Mobile').required(),
            username: Joi.string().label('Username').required()
        }
        return Joi.object(rules);
    }

    refreshProfile() {
        this.state.user_info(this.state.user_info.media.url).then((response) => {
            this.setState({ user_info: response.data.user_info }, () => {
                this.makeMessageView();
            });
        });
    }


    async updateUser() {
        this.setState({ submitLoading: true });
        this.setState({ errors: null });

        let schema = this.validateUserData();
        //console.log(this.state.user_info);

        try {

            //console.log(this.state.user_info);
            let userData = {};
            userData.first_name = this.state.userData.first_name;
            userData.middle_name = this.state.userData.middle_name;
            userData.last_name = this.state.userData.last_name;
            userData.mobile = this.state.userData.mobile;
            userData.email = this.state.userData.email;
            userData.address = this.state.userData.address;
            userData.username = this.state.userData.username;
            //user_info.roles = this.state.user_info.roles;

            const data = await schema.validateAsync(userData);
            var formData = this.makeformData(data);
            let response = await (new Api()).call('POST', API_URL + '/user/updateOwnProfile/' + this.state.user_info.id, formData, (new Token()).get());
            if (response.data.status === 200) {
                this.resetModal();
                this.getUserData();
                // message.success({
                //     content: 'Successfully Updated.',
                //     style: {
                //         marginTop: ANTD_MESSAGE_MARGIN_TOP,
                //     }
                // });

                /**
                 * @Developed by @mominriyadh  on 1/30/2022
                 * @URL https://ant.design/components/notification/*
                 *
                 */
                notification.success({
                    message: 'Successfully Updated',
                    description: 'Data Successfully Updated Now',
                    placement:'bottomRight'
                })

            } else if (response.data.status === 400) {
                this.setState({ submitLoading: false });
                this.setState({ errors: (new Helper.arrayToErrorMessage(response.data.errors)) });
            }

        } catch (err) {
            // console.log(err);
            const { validationError } = this.state;
            this.setState({ submitLoading: false });
            validationError[err.details[0].context.key] = err.details[0].message;
            this.setState({ validationError: validationError });
            validationError[err.details[0].context.key] = '';
        }

    }

    makeformData(data) {
        let formData = new FormData();
        formData.append('first_name', data.first_name);
        formData.append('middle_name', data.middle_name ? data.middle_name : '');
        formData.append('last_name', data.last_name);
        formData.append('address', data.address ? data.address : '');
        formData.append('email', data.email);
        formData.append('mobile', data.mobile);
        formData.append('username', data.username);
        // formData.append('roles',     data.roles);

        return formData;
    }
    validateUserDataId() {
        let rules = {
            first_name: Joi.string().min(3).label('First Name').required(),
            middle_name: Joi.string().allow('', null).min(3).label('Middle Name'),
            address: Joi.string().allow('', null).label('Address'),
            last_name: Joi.string().min(3).label('Last Name').required(),
            email: Joi.string().label('Email').email({ minDomainSegments: 2, tlds: {} }),
            mobile: Joi.string().min(3).label('Mobile').required(),
            username: Joi.string().label('Username').required()
        }
        return Joi.object(rules);
    }

    async fileOnChange(file) {
        this.setState({isAllStateReady: false});
        this.setState({spinning: true});

        let userData = {};
        userData.id = this.state.userData.id;

        var formData = this.makeformData(this.state.userData);
        formData.append('image', file.target.files[0]);
        let response = await (new Api()).call('POST', API_URL + '/user/updateOwnProfile/' + this.state.user_info.id, formData, (new Token()).get());

        if (response) {
            this.getUserData();
        } else if (response.data.status_code == 400) {
            this.setState({ errors: ((new Helper).arrayToErrorMessage(response.data.errors)) });
        }

        this.setState({ spinning: false });
    }

    getComponent() {
        return <>

            <div className="ts-d-top-header mb-4">
                <div className="ts-d-acc-name">
                    <span className="bi bi-list" />
                    <span className="ts-d-acc-name-text text-uppercase">Profile</span>
                </div>
            </div>

            {/*
                Profile Area Start
            */}

            <div className="ts-d-profile-area">
                <div className="ts-d-profile-main">
                    <div className="row">
                        <div className="col-lg-3 col-sm-3">
                            <div className="ts-d-profile-content">
                                <div className="ts-d-profile-avatar">
                                    <img src={this.state.userData.media ? this.state.userData.media.url : NO_PHOTO}
                                        alt="" />

                                        <label className="ts-d-pic-upload" htmlFor="ts-d-pic-upload">
                                            <input type="file" name="" id="ts-d-pic-upload" onChange={(file) => this.fileOnChange(file)} />
                                            <i className="bi bi-camera"> </i>
                                        </label>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-9 col-sm-9">
                            <div className="ts-d-profile-r-contents mt-5">
                                <div className="ts-d-profile-meta">
                                    <div className="ts-d-profile-designation mb-4">
                                        <div className="ts-d-profile-user-name">
                                            <h3 className="text-uppercase">{this.Helper.getFullName( this.state.userData )}</h3>

                                            {/* <h6 className="text-capitalize">Group: {this.state.userData.groups.map((item, index) => (<span key={item.id}>{item.name}{index < this.state.userData.groups.length - 1 && ','}</span>))}</h6> */}
                                        </div>
                                        <div className="ts-d-profile-edit" onClick={this.showModal}>Edit</div>
                                        <div className="ts-d-profile-edit">Change Password</div>
                                    </div>

                                    <div className="ts-d-profile-details">
                                        {/* <p>
                                            <span className="ts-d-personal">
                                                    <i className="bi bi-calendar"/> {new Intl.DateTimeFormat("en-GB", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "2-digit"
                                                }).format(this.state.user_info.email_verified_at ? this.state.user_info.email_verified_at : '')}
                                                </span>

                                        </p> */}
                                        <p>
                                            <span className="ts-d-personal"><i
                                                className="bi bi-people-fill" /> Group: {this.state.userData.groups.map((item, index) => (<span key={item.id}>{item.name}{index < this.state.userData.groups.length - 1 && ','}</span>))}</span>

                                        </p>
                                        <p>
                                            <span className="ts-d-personal"><i
                                                className="bi bi-telephone-fill" /> {this.state.userData.mobile ? this.state.userData.mobile : ''}</span>

                                        </p>
                                        <p>
                                            <span className="ts-d-personal">
                                                <i className="bi bi-envelope" />
                                                {this.state.userData.email ? this.state.userData.email : ''}
                                            </span>

                                        </p>
                                        <p>
                                            <span className="ts-d-personal">
                                                <i className="bi bi-house-door" />
                                                {this.state.userData.address ? this.state.userData.address : 'N/A'}
                                            </span>
                                        </p>
                                    </div>

                                </div>

                                <div className="ts-d-user-statistics">
                                    <h5 className="text-uppercase mt-5 mb-3">user statistics</h5>
                                    <div className="row">

                                        <div className="ts-d-user-statistics-main">

                                            <div className="ts-ticket-f-buttons-area">
                                                <div className="ts-d-f-ticket ts-total-ticket">

                                                    <div className="ts-d-f-ticket-header">
                                                        <span className="ts-d-f-ticket-title">Create Ticket</span>
                                                        <span className="ts-ticket-f-icon ts-icon-blue">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                                                className="bi bi-ticket-detailed " viewBox="0 0 16 16">
                                                                <path fillRule="evenodd"
                                                                    d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13ZM4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
                                                            </svg>
                                                        </span>

                                                    </div>

                                                    <span className="ts-d-f-ticket-no">{this.state.userStatisticsData.total_create_ticket ? this.state.userStatisticsData.total_create_ticket : 'N/A'}</span>
                                                    <p></p>


                                                </div>

                                                <div className="ts-d-f-ticket ts-total-ticket">

                                                    <div className="ts-d-f-ticket-header">
                                                        <span className="ts-d-f-ticket-title">Open Ticket</span>
                                                        <span className="ts-ticket-f-icon ts-icon-sky">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                                                className="bi bi-ticket-detailed " viewBox="0 0 16 16">
                                                                <path fillRule="evenodd"
                                                                    d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13ZM4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
                                                            </svg>
                                                        </span>

                                                    </div>
                                                    <span className="ts-d-f-ticket-no">{this.state.userStatisticsData.total_open_ticket ? this.state.userStatisticsData.total_open_ticket : 'N/A'}</span>
                                                    <p></p>
                                                </div>

                                                <div className="ts-d-f-ticket ts-total-ticket">

                                                    <div className="ts-d-f-ticket-header">
                                                        <span className="ts-d-f-ticket-title">Close Ticket</span>
                                                        <span className="ts-ticket-f-icon ts-icon-green">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                                                className="bi bi-ticket-detailed " viewBox="0 0 16 16">
                                                                <path fillRule="evenodd"
                                                                    d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13ZM4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
                                                            </svg>
                                                        </span>

                                                    </div>
                                                    <span className="ts-d-f-ticket-no">{this.state.userStatisticsData.total_close_ticket ? this.state.userStatisticsData.total_close_ticket : 'N/A'}</span>
                                                    <p>
                                                    </p>


                                                </div>

                                                <div className="ts-d-f-ticket ts-total-ticket">
                                                    <div className="ts-d-f-ticket-header">
                                                        <span className="ts-d-f-ticket-title">Pending Ticket</span>
                                                        <span className="ts-ticket-f-icon ts-icon-pink">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                                                className="bi bi-trash" viewBox="0 0 16 16">
                                                                <path
                                                                    d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                                <path fillRule="evenodd"
                                                                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                                            </svg>
                                                        </span>

                                                    </div>
                                                    <span className="ts-d-f-ticket-no">{this.state.userStatisticsData.total_pending_ticket ? this.state.userStatisticsData.total_pending_ticket : 'N/A'}</span>
                                                    <p>
                                                    </p>
                                                </div>
                                            </div>
                                            {/* <div className="ts-d-f-activity">

                                                <div
                                                    className="ts-d-f-activity-header d-flex justify-content-between">
                                                    <h6 className="text-uppercase">Recent Activity</h6>
                                                    <i className="bi bi-three-dots-vertical" />
                                                </div>


                                                <div className="ts-d-f-activity-log">
                                                    <ul className="timeline">
                                                        <li className="timeline-item">

                                                            <div className="timeline-marker"></div>
                                                            <div className="timeline-content">
                                                                <p>You sold an item Paul Burgess just purchased
                                                                    “Hyper -
                                                                    Admin Dashboard”! 5 minutes ago
                                                                </p>
                                                            </div>
                                                        </li>
                                                        <li className="timeline-item">
                                                            <div className="timeline-marker"></div>
                                                            <div className="timeline-content">

                                                                <p>Product on the Bootstrap Market Dave Gamache
                                                                    added Admin
                                                                    Dashboard 30 minutes ago
                                                                </p>
                                                            </div>
                                                        </li>
                                                        <li className="timeline-item">
                                                            <div className="timeline-marker"></div>
                                                            <div className="timeline-content">

                                                                <p>Product on the Bootstrap Market Dave Gamache
                                                                    added Admin
                                                                    Dashboard 30 minutes ago
                                                                </p>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>


                                            </div> */}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*
                End Profile Area
                */}

            <Modal
                zIndex="1050"
                centered
                title="Edit Profile" visible={this.state.isModalVisible} onOk={this.handleOk} footer={[
                <Button key="back" onClick={this.handleCancel}>
                    Close
                </Button>,
                <Button
                    className={this.state.actionType === "view" ? "d-none" : ""}
                    loading={this.state.submitLoading}
                    key="Update"
                    type="primary"
                    onClick={this.updateUser}

                >
                    Submit
                </Button>
            ]} onCancel={this.handleCancel}>
                <form className="row g-3 needs-validation" encType="multipart/form-data">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">First name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="first_name"
                            value={this.state.userData.first_name} id="first_name" placeholder="First Name"
                            onChange={this.onChangeHandler} />
                        <div className="text-danger">{this.state.validationError.first_name}</div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Middle name</label>
                        <input type="text" className="form-control" name="middle_name"
                            value={this.state.userData.middle_name} id="middle_name" placeholder="Middle Name"
                            onChange={this.onChangeHandler} />
                        <div className="text-danger">{this.state.validationError.middle_name}</div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Last name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="last_name"
                            value={this.state.userData.last_name} id="last_name" placeholder="Last Name"
                            onChange={this.onChangeHandler} />
                        <div className="text-danger">{this.state.validationError.last_name}</div>
                    </div>

                    <div className="col-md-12 mb-3">
                        <label className="form-label">Address</label>
                        <input type="text" className="form-control" name="address"
                            value={this.state.userData.address} id="address" placeholder="Address"
                            onChange={this.onChangeHandler} />
                        <div className="text-danger">{this.state.validationError.address}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Email <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="email" value={this.state.userData.email}
                            id="email" placeholder="Email" onChange={this.onChangeHandler} />
                        <div className="text-danger">{this.state.validationError.email}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Mobile <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="mobile"
                            value={this.state.userData.mobile} id="mobile" placeholder="Mobile"
                            onChange={this.onChangeHandler} />
                        <div className="text-danger">{this.state.validationError.mobile}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Username <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="username"
                            value={this.state.userData.username} id="username" placeholder="Username"
                            onChange={this.onChangeHandler} />
                        <div className="text-danger">{this.state.validationError.username}</div>
                    </div>
                </form>
            </Modal>

        </>
    }


    render() {
        return (
            <Layout>
                <Spin size="medium" tip="Please Wait..." spinning={this.state.spinning}></Spin>
                {this.state.isAllStateReady ? this.getComponent() : null}
            </Layout>
        )
    }
}

export default Profile;

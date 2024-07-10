import React from "react";
import Layout from "../../components/common/Layout";
import MonthlyStatement from "../../components/charts/MonthlyStatement";
import WeeklyReport from "../../components/charts/WeeklyReport";
import {DatePicker, Space} from "antd";


function onChange(date, dateString) {
    // console.log(date, dateString);
}

class Dashboard extends React.Component {

    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <Layout title={this.state.title}>

                <div className="ts-d-top-header mb-3">
                    <div className="ts-d-acc-name">
                        <span className="bi bi-list"/>
                        <span className="ts-d-acc-name-text text-uppercase"> Dashboard</span>
                    </div>

                    <div className="ts-d-date">
                        <Space direction="vertical">
                            <DatePicker  onChange={onChange} />
                        </Space>
                        <span className="bi bi-filter ts-d-filter"/>
                    </div>

                </div>

                <div className="row">
                    <div className="col-lg-5">
                        <div className="ts-ticket-buttons-area">
                            <div className="ts-d-ticket ts-total-ticket">

                                <div className="ts-d-ticket-header">
                                    <span className="ts-d-ticket-title">Total Ticket</span>
                                    <span className="ts-ticket-icon ts-icon-blue">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                  className="bi bi-ticket-detailed " viewBox="0 0 16 16">
                            <path fillRule="evenodd"
                                  d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13ZM4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"/>
                        </svg>
                        </span>

                                </div>

                                <span className="ts-d-ticket-no">5125</span>
                                <p>
                        <span className="ts-roi-plus">
                            <i className="bi bi-forward-fill"/> 5.27%
                        </span> Since Last Month
                                </p>


                            </div>

                            <div className="ts-d-ticket ts-total-ticket">

                                <div className="ts-d-ticket-header">
                                    <span className="ts-d-ticket-title">Create Ticket</span>
                                    <span className="ts-ticket-icon ts-icon-sky">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                  className="bi bi-ticket-detailed " viewBox="0 0 16 16">
                            <path fillRule="evenodd"
                                  d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13ZM4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"/>
                        </svg>
                        </span>

                                </div>
                                <span className="ts-d-ticket-no">5125</span>
                                <p>
                        <span className="ts-roi-minus">
                            <i className="bi bi-forward-fill"/> 5.27%
                        </span> Since Last Month
                                </p>


                            </div>

                            <div className="ts-d-ticket ts-total-ticket">

                                <div className="ts-d-ticket-header">
                                    <span className="ts-d-ticket-title">Open Ticket</span>
                                    <span className="ts-ticket-icon ts-icon-pink">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                  className="bi bi-ticket-detailed " viewBox="0 0 16 16">
                            <path fillRule="evenodd"
                                  d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13ZM4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"/>
                        </svg>
                        </span>

                                </div>
                                <span className="ts-d-ticket-no">5125</span>
                                <p>
                        <span className="ts-roi-minus">
                            <i className="bi bi-forward-fill"/> 5.27%
                        </span> Since Last Month
                                </p>


                            </div>

                            <div className="ts-d-ticket ts-total-ticket">
                                <div className="ts-d-ticket-header">
                                    <span className="ts-d-ticket-title">Close Ticket</span>
                                    <span className="ts-ticket-icon ts-icon-green">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                  className="bi bi-ticket-detailed " viewBox="0 0 16 16">
                            <path fillRule="evenodd"
                                  d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13ZM4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"/>
                        </svg>
                        </span>

                                </div>
                                <span className="ts-d-ticket-no">5125</span>
                                <p>
                        <span className="ts-roi-plus">
                            <i className="bi bi-forward-fill"/> 5.27%
                        </span> Since Last Month
                                </p>
                            </div>
                        </div>

                    </div>


                    <div className="col-lg-7">
                        <div className="row">
                            <div className="col-md-6">
                                <div id="ts-msc">
                                    <MonthlyStatement/>
                                </div>

                            </div>

                            <div className="col-md-6">
                                <div id="ts-wgr">
                                    <WeeklyReport/>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>


                <div className="ts-d-workprocess-table-area mt-4">
                    <div className="row">
                        <div className="col-lg-12">

                            <div className="ts-workprocess-table-main">

                                <div className="ts-workprocess-table-header">
                                    <p className="ts-components-title text-uppercase">WORK PROCESS</p>
                                    <span><i className="bi bi-three-dots-vertical"/></span>
                                </div>


                                <div className="ts-workprocess-table-content table-responsive">
                                    <table className="table table-bordered table-hover">
                                        <thead>
                                        <tr>
                                            <th className="text-center" scope="col"> SL.No</th>
                                            <th scope="col">Product</th>
                                            <th scope="col">Subject</th>
                                            <th scope="col">Creator</th>
                                            <th scope="col">Client ID</th>
                                            <th scope="col">TIME</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Details</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <th className="text-center" scope="row">1</th>
                                            <td>Mark</td>
                                            <td>Otto</td>
                                            <td>@mdo</td>
                                            <td>Mark</td>
                                            <td>Otto</td>
                                            <td>
                                                <div className="ts-status-area">
                                                    <span className="ts-status-text-done">Done</span>
                                                    <span className="ts-status-done"/>
                                                </div>
                                            </td>
                                            <td>Otto</td>
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">2</th>
                                            <td>Jacob</td>
                                            <td>Thornton</td>
                                            <td>@fat</td>
                                            <td>Mark</td>
                                            <td>Otto</td>
                                            <td>
                                                <div className="ts-status-area">
                                                    <span className="ts-status-text-expired">Expired</span>
                                                    <span className="ts-status-expired"/>
                                                </div>
                                            </td>
                                            <td>Otto</td>
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">3</th>
                                            <td>Larry</td>
                                            <td>the Bird</td>
                                            <td>@twitter</td>
                                            <td>Mark</td>
                                            <td>Otto</td>
                                            <td>
                                                <div className="ts-status-area">
                                                    <span className="ts-status-text-pending">Pending</span>
                                                    <span className="ts-status-pending"/>
                                                </div>
                                            </td>
                                            <td>Otto</td>
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">4</th>
                                            <td>Larry</td>
                                            <td>the Bird</td>
                                            <td>@twitter</td>
                                            <td>Mark</td>
                                            <td>Otto</td>
                                            <td>
                                                <div className="ts-status-area">
                                                    <span className="ts-status-text-process">Process</span>
                                                    <span className="ts-status-process"/>
                                                </div>
                                            </td>
                                            <td>Otto</td>
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">5</th>
                                            <td>Larry</td>
                                            <td>the Bird</td>
                                            <td>@twitter</td>
                                            <td>Mark</td>
                                            <td>Otto</td>
                                            <td>
                                                <div className="ts-status-area">
                                                    <span className="ts-status-text-done">Done</span>
                                                    <span className="ts-status-done"/>
                                                </div>
                                            </td>
                                            <td>Otto</td>
                                        </tr>
                                        <tr>
                                            <th className="text-center" scope="row">6</th>
                                            <td>Larry</td>
                                            <td>the Bird</td>
                                            <td>@twitter</td>
                                            <td>Mark</td>
                                            <td>Otto</td>
                                            <td>
                                                <div className="ts-status-area">
                                                    <span className="ts-status-text-process">Process</span>
                                                    <span className="ts-status-process"/>
                                                </div>
                                            </td>
                                            <td>Otto</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </Layout>
        )
    }
}

export default Dashboard;

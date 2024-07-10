import React from "react";
import Layout from "../../components/common/Layout";
import {DatePicker, Space} from "antd";
import ServiceLevel from "../../components/charts/ServiceLevel";
import WeeklyServiceLevel from "../../components/charts/WeeklyServiceLevel";


function onChange(date, dateString) {
    // console.log(date, dateString);
}


class Report extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <Layout>
                <div className="ts-d-top-header mb-3">
                    <div className="ts-d-acc-name">
                        <span className="bi bi-list"/>
                        <span className="ts-d-acc-name-text text-uppercase"> report</span>
                    </div>

                    <div className="ts-d-date">
                        <Space direction="vertical">
                            <DatePicker onChange={onChange}/>
                        </Space>
                        <span className="bi bi-filter ts-d-filter"/>
                    </div>

                </div>

                <div className="container-fluid p-0">
                    <div className="row">
                        <div className="col-lg-3 col-md-4">
                            <div className="ts-d-report-buttons-area">
                                <div className="ts-d-r-ticket">

                                    <div className="ts-d-ticket-header">
                                        <span className="ts-d-ticket-title">Sender Pending</span>
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
                                <div className="ts-d-r-ticket">

                                    <div className="ts-d-ticket-header">
                                        <span className="ts-d-ticket-title">Recipient Pending</span>
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
                            </div>
                        </div>

                        <div className="col-lg-9 col-md-8 ">
                            <div className="ts-d-report-graph-area">
                                <div className="ts-d-service-label-graph">
                                    <ServiceLevel/>
                                </div>

                                <div className="ts-d-weekly-service-label-graph">
                                    <WeeklyServiceLevel/>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </Layout>
        )
    }
}

export default Report;

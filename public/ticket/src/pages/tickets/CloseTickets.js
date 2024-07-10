import React from "react";
import Layout from "../../components/common/Layout";
import {NavLink} from "react-router-dom";

class CloseTickets extends React.Component {
    render() {
        return (
            <Layout>
                <div className="ts-d-top-header mb-4">
                    <div className="ts-d-acc-name">
                        <span className="bi bi-list"/>
                        <span className="ts-d-acc-name-text text-uppercase">open ticket</span>
                    </div>
                </div>


                {/* Ticket Area*/}
                <div class="ts-d-tickets-area">


                    {/*Submenu Area*/}
                    <div class="ts-d-submenu-area">
                        <div class="ts-d-left-toolbar ts-d-top-toolbar">
                            <ul>
                                <li>
                                    <a href="/">
                                        <i class="bi bi-house-door"></i> Home
                                    </a>
                                </li>
                                <li>
                                    <a href="/">
                                        <i class="bi bi-ui-checks"></i> My Job
                                    </a>
                                </li>
                                <li>
                                    <a href="/">
                                        <i class="bi bi-file-lock"></i> Change Password
                                    </a>
                                </li>
                            </ul>
                        </div>


                        <div class="ts-d-right-toolbar ts-d-top-toolbar">
                            <ul>
                                <li>
                                    <NavLink to="/open-ticket">
                                        <i className="bi bi-folder2-open"></i> Opened Ticket
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/close-ticket">
                                        <i className="bi bi-folder-x"></i> Close Ticket
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/*End Submenu Area*/}


                    {/*All Open Tickets*/}
                    <div className="ts-d-tickets-overview">

                        {/*Search*/}
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="ts-d-search-area">
                                    <form id="ts-d-search" action="">
                                        <input type="search" name="" id="" placeholder="Search your item..." required/>
                                        <button className="ts-d-search-btn" type="submit">Search</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        {/* End Search*/}


                        {/*Work Process*/}
                        <div className="ts-d-workprocess-table-area mt-4">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="ts-workprocess-table-main">
                                        <div className="ts-workprocess-table-header">
                                            <p className="ts-components-title text-uppercase">WORK PROCESS</p>
                                            <span><i className="bi bi-three-dots-vertical"></i></span>
                                        </div>
                                        <div className="ts-workprocess-table-content table-responsive">

                                            <table className="table table-bordered table-hover">
                                                <thead>
                                                <tr>
                                                    <th className="text-center" scope="col"> Ticket Ref #</th>
                                                    <th scope="col">Product</th>
                                                    <th scope="col">Subject</th>
                                                    <th scope="col">Creator</th>
                                                    <th scope="col">Client ID</th>
                                                    <th scope="col">Assg. To</th>
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
                                                    <td>007</td>
                                                    <td>Otto</td>
                                                    <td>
                                                        <span>02:45 pm, 14-06-21</span>
                                                    </td>
                                                    <td>
                                                        <div className="ts-status-area">
                                                            <span className="ts-status-text-done">Done</span>
                                                            <span className="ts-status-done"></span>
                                                        </div>
                                                    </td>
                                                    <td>Otto</td>
                                                </tr>
                                                <tr>
                                                    <th className="text-center" scope="row">2</th>
                                                    <td>Jacob</td>
                                                    <td>Thornton</td>
                                                    <td>@fat</td>
                                                    <td>007</td>
                                                    <td>Otto</td>
                                                    <td>
                                                        <span>02:45 pm, 14-06-21</span>
                                                    </td>
                                                    <td>
                                                        <div className="ts-status-area">
                                                            <span className="ts-status-text-done">Done</span>
                                                            <span className="ts-status-done"></span>
                                                        </div>
                                                    </td>
                                                    <td>Otto</td>
                                                </tr>
                                                <tr>
                                                    <th className="text-center" scope="row">3</th>
                                                    <td>Larry</td>
                                                    <td>the Bird</td>
                                                    <td>@twitter</td>
                                                    <td>007</td>
                                                    <td>Otto</td>
                                                    <td>
                                                        <span>02:45 pm, 14-06-21</span>
                                                    </td>
                                                    <td>
                                                        <div className="ts-status-area">
                                                            <span className="ts-status-text-done">Done</span>
                                                            <span className="ts-status-done"></span>
                                                        </div>
                                                    </td>
                                                    <td>Otto</td>
                                                </tr>
                                                <tr>
                                                    <th className="text-center" scope="row">4</th>
                                                    <td>Larry</td>
                                                    <td>the Bird</td>
                                                    <td>@twitter</td>
                                                    <td>007</td>
                                                    <td>Otto</td>
                                                    <td>
                                                        <span>02:45 pm, 14-06-21</span>
                                                    </td>
                                                    <td>
                                                        <div className="ts-status-area">
                                                            <span className="ts-status-text-done">Done</span>
                                                            <span className="ts-status-done"></span>
                                                        </div>
                                                    </td>
                                                    <td>Otto</td>
                                                </tr>
                                                <tr>
                                                    <th className="text-center" scope="row">5</th>
                                                    <td>Larry</td>
                                                    <td>the Bird</td>
                                                    <td>@twitter</td>
                                                    <td>007</td>
                                                    <td>Otto</td>
                                                    <td>
                                                        <span>02:45 pm, 14-06-21</span>
                                                    </td>
                                                    <td>
                                                        <div className="ts-status-area">
                                                            <span className="ts-status-text-done">Done</span>
                                                            <span className="ts-status-done"></span>
                                                        </div>
                                                    </td>
                                                    <td>Otto</td>
                                                </tr>
                                                <tr>
                                                    <th className="text-center" scope="row">6</th>
                                                    <td>Larry</td>
                                                    <td>the Bird</td>
                                                    <td>@twitter</td>
                                                    <td>007</td>
                                                    <td>Otto</td>
                                                    <td>
                                                        <span>02:45 pm, 14-06-21</span>
                                                    </td>
                                                    <td>
                                                        <div className="ts-status-area">
                                                            <span className="ts-status-text-done">Done</span>
                                                            <span className="ts-status-done"></span>
                                                        </div>
                                                    </td>
                                                    <td>Details</td>
                                                </tr>
                                                </tbody>
                                            </table>


                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*Pagination*/}
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="ts-d-pagination">

                                        <div className="page-navigation">
                                            <nav aria-label="Page navigation">
                                                <ul className="pagination">
                                                    <li className="page-item">
                                                        <a className="page-link" href="#" aria-label="Previous">
                                                        <span className="bi bi-chevron-compact-left"
                                                              aria-hidden="true"></span>
                                                        </a>
                                                    </li>
                                                    <li className="page-item"><a className="page-link"
                                                                                 href="#">1</a></li>
                                                    <li className="page-item"><a className="page-link"
                                                                                 href="#">2</a></li>
                                                    <li className="page-item"><a className="page-link"
                                                                                 href="#">3</a></li>
                                                    <li className="page-item">
                                                        <a className="page-link" href="#" aria-label="Next">
                                                        <span className="bi bi-chevron-compact-right"
                                                              aria-hidden="true"></span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>

                                        {/*  Custom Select*/}
                                        <div className="ml-auto">
                                            <label htmlFor="ts-d-show-col">Show
                                                <select className="ts-d-custom-select" id="ts-d-show-col">
                                                    <option selected>10</option>
                                                    <option value="1">20</option>
                                                    <option value="2">50</option>
                                                    <option value="3">100</option>
                                                </select>
                                            </label>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                        {/* End Work Process*/}

                    </div>
                    {/*End All Open Tickets*/}


                </div>
                {/*End Ticket Area*/}
            </Layout>
        )
    }
}

export default CloseTickets;

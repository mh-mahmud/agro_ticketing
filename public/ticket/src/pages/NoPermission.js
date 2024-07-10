import React, {Component} from 'react';
import {Link} from 'react-router-dom';

// Images
import PROTECTION from "../assets/images/safe-access.svg";

class NoPermission extends Component {
    render() {
        return (
            <section className="ts-d-page_404">
                <div className="container">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-sm-12 align-items-center">
                            <div className="col-sm-10 mx-sm-auto text-center">
                                <div className="content_box_404">
                                    <img className={"img-fluid"} src={PROTECTION} alt=""/>
                                    <hr/>

                                    <h2>
                                        Sorry! You don't have permission to do this
                                    </h2>

                                    <Link to="/dashboard" className="btn btn-success">Go to Dashboard</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default NoPermission;

import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import Auth from '../services/Auth';

export default class NotFound extends Component {
    
    componentDidMount(){
        if( !(new Auth()).isAuthenticated() ) {
            window.location.href = "/ticket";
        }
    }

    render() {
        return (
            <section className="ts-d-page_404">
                <div className="container">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-sm-12 align-items-center">
                            <div className="col-sm-10 mx-sm-auto text-center">
                                <div className="four_zero_four_bg">
                                    <h1 className="text-center">404</h1>
                                </div>

                                <div className="content_box_404">
                                    <h2>
                                        Look like you're lost
                                    </h2>

                                    <p>the page you are looking for not available!</p>

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

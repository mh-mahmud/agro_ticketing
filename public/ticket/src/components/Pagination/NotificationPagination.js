import React, { Component } from 'react'
import ReactPaginate from "react-paginate";

export default class NotificationPagination extends Component {
    render() {
        return (
            <div className={"mt-3"}>
                <ReactPaginate
                    previousLabel       ={"Previous"}
                    nextLabel           ={"Next"}
                    breakLabel          ={"..."}
                    pageCount           ={this.props.pageCountList}
                    marginPagesDisplayed={3}
                    pageRangeDisplayed  ={3}
                    onPageChange        ={this.props.handleNotificationPageClick}
                    containerClassName  ={"pagination justify-content-center"}
                    pageClassName       ={"page-item"}
                    pageLinkClassName   ={"page-link"}
                    previousClassName   ={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextClassName       ={"page-item"}
                    nextLinkClassName   ={"page-link"}
                    breakClassName      ={"page-item"}
                    breakLinkClassName  ={"page-link"}
                    activeClassName     ={"active"}
                />
            </div>
        )
    }
}

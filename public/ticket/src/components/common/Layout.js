import React from "react";
import {withRouter} from "react-router-dom";

class Layout extends React.Component {
    
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                {this.props.children}
            </>
        )
    }

}

export default withRouter(Layout);

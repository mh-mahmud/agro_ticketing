import React, { Component } from 'react'

export default class Checkbox extends Component {
    render() {
        return (
            <>
                <input
                    key={this.props.id}
                    onChange={this.props.handleCheckChieldElement}
                    type="checkbox"
                    checked={this.props.isChecked}
                    value={this.props.value}
                    disabled={this.props.disabled}
                />
            </>
        )
    }
}
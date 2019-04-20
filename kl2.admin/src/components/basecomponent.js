import React, { Component } from 'react';


class BaseComponent extends Component {
    constructor(props) {
        super(props);

    }

    handleChange = event => {
        this.setState({
            Rec: {
                [event.target.id]: event.target.value
            }
        });
    }

    handleSubmit = event => {
        event.preventDefault();
    }


    render() {
        return (<div>kooooor</div>);
    }
}

export default BaseComponent;
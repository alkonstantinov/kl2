import React, { Component } from 'react';
import SessionManager from '../modules/session';
import Trans from '../data/translation.json';

class BaseComponent extends Component {

    SM = new SessionManager();

    constructor(props) {
        super(props);
        this.HandleChange = this.HandleChange.bind(this);
        this.HandleSubmit = this.HandleSubmit.bind(this);

    }

    T(key) {
        return Trans[this.SM.GetLanguage()][key];
    }

    HandleChange = event => {
        this.setState({
            Rec: {
                [event.target.id]: event.target.value
            }
        });
    }

    HandleSubmit = event => {
        event.preventDefault();
    }

    ShowSpin() {
        this.setState({ spinner: true });
    }

    HideSpin() {
        this.setState({ spinner: false });
    }



    render() {
        return (<div>kooooor</div>);
    }
}

export default BaseComponent;
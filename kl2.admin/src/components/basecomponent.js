import React, { Component } from 'react';
import SessionManager from '../modules/session';
import Trans from '../data/translation.json';

class BaseComponent extends Component {

    SM = new SessionManager();

    constructor(props) {
        super(props);
        this.HandleChange = this.HandleChange.bind(this);
        this.HandleSubmit = this.HandleSubmit.bind(this);
        this.Refresh = this.Refresh.bind(this);

        this.state = {
            Error: null,
            spinner: false,
            Rec: {}
        };

    }

    Refresh() {
        window.location.reload();
    }

    T(key) {
        return Trans[this.SM.GetLanguage()] ? Trans[this.SM.GetLanguage()][key] : "";
    }

    TranslateIntoLanguage(key, lang) {
        return Trans[lang] ? Trans[lang][key] : "";
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
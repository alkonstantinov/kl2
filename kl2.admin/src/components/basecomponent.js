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
        this.ConvertArrayToObject = this.ConvertArrayToObject.bind(this);
        this.ValidateEmail = this.ValidateEmail.bind(this);



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
        var rec = this.state.Rec;
        rec[event.target.id] = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        this.setState({
            Rec: rec
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


    ConvertArrayToObject(array) {
        var result = new Object(null);
        array.forEach(item => result[item] = true);

        return result;
    }

    ConvertObjectToArray(obj) {
        var result = [];
        Object.keys(obj).forEach(item => {
            if (obj[item])
                result.push(item)
        });

        return result;
    }

    ValidateEmail(mail) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(mail);
    }


    render() {
        return (<div>kooooor</div>);
    }
}

export default BaseComponent;
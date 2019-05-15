import React, { Component } from 'react';
import eventClient from '../modules/eventclient';
import { Link } from 'react-router-dom';
import BaseComponent from './basecomponent';
import { SelectButton } from 'primereact/selectbutton';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';


const options = [
    { label: 'EN', value: 'en' },
    { label: 'SQ', value: 'sq' }
];

class Language extends BaseComponent {
    constructor(props) {
        super(props);
        this.SetLanguage = this.SetLanguage.bind(this);



    }


    SetLanguage(language) {
        this.SM.SetLanguage(language);
        eventClient.emit('language');
    }

    render() {
        var self = this;
        return (
            <SelectButton value={self.SM.GetLanguage()} options={options} onChange={(e) => this.SetLanguage(e.value)} />
        )
    }
}

export default Language;
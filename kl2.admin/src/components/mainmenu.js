import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import BaseComponent from './basecomponent';
import eventClient from '../modules/eventclient';
import { Link } from 'react-router-dom';

class MainMenu extends BaseComponent {
    constructor(props) {
        super(props);
        eventClient.emit(
            "breadcrump",
            [{
                title: this.T("mainmenu")
            }]
        )
        this.state = {

        };


    }







    render() {
        var self = this;
        return (

            <div className="container mt-3">
                <Link className="btn btn-default" to='/companydata'>
                    <i className="fas fa-list"></i>
                    <p>ьььььььь</p>
                </Link>
            </div>

        )
    }
}

export default MainMenu;
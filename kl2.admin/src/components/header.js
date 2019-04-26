import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import BaseComponent from './basecomponent';
import eventClient from '../modules/eventclient';
import { Link } from 'react-router-dom';

class Header extends BaseComponent {
    constructor(props) {
        super(props);
        this.Logout = this.Logout.bind(this);
        this.SetBreadcrump = this.SetBreadcrump.bind(this);

        this.state = {
            user: this.SM.GetSession(),
            breadcrumbs: [],
            logout: false

        };


    }

    SetBreadcrump(data) {
        this.setState({ breadcrumbs: data })
    }

    componentWillMount() {
        eventClient.on('breadcrump', this.SetBreadcrump);
    }

    componentWillUnmount() {
        eventClient.removeEventListener('breadcrump', this.SetBreadcrump);
    }



    Logout() {
        this.SM.Logout();
        eventClient.emit('loginchange');
    }

    render() {
        var self = this;
        return (
            <header className="navbar">
                <div className="col-9">
                    {
                        self.state.breadcrumbs.map((obj, i) =>
                            <span>
                                {
                                    obj.href ?
                                        <Link to={'/' + obj.href}>
                                            {obj.title}
                                        </Link>
                                        :
                                        obj.title
                                }
                                &nbsp;



                                {i === self.state.breadcrumbs.length ? null : <i className="fas fa-chevron-right fa-xs"></i>}

                            </span>

                        )}
                </div>
                <div className="col-2">
                    {self.state.user.username}
                </div>
                <div className="col-1">
                    <i class="fas fa-power-off" onClick={self.Logout}></i>
                </div>
            </header>
        )
    }
}

export default Header;
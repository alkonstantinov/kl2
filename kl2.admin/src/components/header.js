import React from 'react';
import BaseComponent from './basecomponent';
import eventClient from '../modules/eventclient';
import { Link } from 'react-router-dom';
import Language from './language';
import Comm from '../modules/comm';

class Header extends BaseComponent {
    constructor(props) {
        super(props);
        this.Logout = this.Logout.bind(this);
        this.SetBreadcrump = this.SetBreadcrump.bind(this);

        this.state = {
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

        Comm.Instance().get('admin/logout').then(result => alert(result));
        this.SM.Logout();
        eventClient.emit('loginchange');
    }

    render() {
        var self = this;
        var user = self.SM.GetSession();
        return (
            <header className="navbar">
                <div className="col-7">
                    {
                        user === null ? null :
                            self.state.breadcrumbs.map((obj, i) =>
                                <span key={i}>
                                    {
                                        obj.href !== undefined ?
                                            <Link to={'/' + obj.href} key={i}>
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
                    <Language></Language>
                </div>
                <div className="col-2">
                    {
                        user === null ? null : user.username
                    }
                </div>
                <div className="col-1">
                    {
                        user === null ? null : <i className="fas fa-power-off" onClick={self.Logout}></i>
                    }

                </div>
            </header>
        )
    }
}

export default Header;
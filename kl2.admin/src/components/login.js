import React from 'react';
import BaseComponent from './basecomponent';
import Loader from 'react-loader-spinner';
import Axios from 'axios';
import { toast } from 'react-toastify';
import { Redirect } from 'react-router-dom';
import eventClient from '../modules/eventclient';




class Login extends BaseComponent {
    constructor(props) {
        super(props);
        this.Login = this.Login.bind(this);

    }




    Login() {

        this.ShowSpin();
        var self = this;

        Axios.get('https://www.dir.bg')
            .then(result => {
                self.SM.SetSession({
                    username: "Александър Константинов",
                    token: 123,
                    level: "admin"
                });
                eventClient.emit("loginchange");
            })
            .catch(error => {
                toast.error(error.message);

            })
            .then(() => self.HideSpin());

    }




    render() {
        var self = this;
        return (
            <p>
                {
                    this.state.spinner === true ?
                        <Loader
                            type="ThreeDots"
                            color="#00BFFF"

                            height="100"
                            width="100"
                        /> :
                        self.SM.GetSession() !== null ?
                            <Redirect to={"/mainmenu"} push></Redirect>
                            :
                            <div className="form-signin">
                                <h2 className="form-signin-heading">{self.T("pleasesignin")}</h2>
                                <label htmlFor="inputEmail" className="control-label">{self.T("username")}</label>
                                <input type="email" id="inputEmail" className="form-control" placeholder={self.T("username")} required autoFocus value={self.state.Rec.username} onChange={self.HandleChange}></input>
                                <label htmlFor="inputPassword" className="control-label">{self.T("password")}</label>
                                <input type="password" id="inputPassword" className="form-control" placeholder={self.T("password")} required value={self.state.Rec.password} onChange={self.HandleChange}></input>

                                <button className="btn btn-lg btn-primary btn-block" type="button" onClick={self.Login}>{self.T("signin")}</button>
                            </div>
                }
            </p>
        );
    }
}

export default Login;
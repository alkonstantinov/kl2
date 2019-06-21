import React from 'react';
import BaseComponent from './basecomponent';
import Loader from 'react-loader-spinner';
import Axios from 'axios';
import { toast } from 'react-toastify';
import { Redirect } from 'react-router-dom';
import eventClient from '../modules/eventclient';
import serverdata from '../data/serverdata.json';
import Comm from '../modules/comm';



class Login extends BaseComponent {
    constructor(props) {
        super(props);
        this.Login = this.Login.bind(this);

    }




    Login() {

        this.ShowSpin();
        var self = this;
        var postData = {
            mail: self.state.Rec.username,
            password: self.state.Rec.password

        };

        Comm.Instance().post('admin/login', postData)
            .then(result => {
                self.SM.SetSession({
                    username: result.data.name,
                    token: result.data.token,
                    level: result.data.type
                });
                Comm.Instance().defaults.headers.common['Authorization'] = result.data.token;
                eventClient.emit("loginchange");
            })
            .catch(error => {
                if (error.response.status === 401)
                    toast.error(self.T("invalidusernameorpassword"));
                else
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
                                <input type="email" id="username" className="form-control" placeholder={self.T("username")} required autoFocus value={self.state.Rec.username} onChange={self.HandleChange}></input>
                                <label htmlFor="inputPassword" className="control-label">{self.T("password")}</label>
                                <input type="password" id="password" className="form-control" placeholder={self.T("password")} required value={self.state.Rec.password} onChange={self.HandleChange}></input>

                                <button className="btn btn-lg btn-primary btn-block" type="button" onClick={self.Login}>{self.T("signin")}</button>
                            </div>
                }
            </p>
        );
    }
}

export default Login;
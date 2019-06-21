import React from 'react';
import eventClient from '../modules/eventclient';
import BaseComponent from './basecomponent';
import Loader from 'react-loader-spinner';
import Axios from 'axios';
import userlist from '../data/userlist';
import { toast } from 'react-toastify';
import Comm from '../modules/comm';

export default class Users extends BaseComponent {
    RowCount = 10;
    constructor(props) {
        super(props);
        eventClient.emit(
            "breadcrump",
            [{
                title: this.T("mainmenu"),
                href: ""
            },
            {
                title: this.T("users")
            }]
        )


        this.Search = this.Search.bind(this);
        this.ShowMore = this.ShowMore.bind(this);
        this.Edit = this.Edit.bind(this);
        this.Cancel = this.Cancel.bind(this);
        this.Save = this.Save.bind(this);

        this.state.Searching = false;
        this.state.Mode = "search"
    }

    Search() {
        var rec = this.state.Rec;

        this.setState({
            Searching: true,
            Rows: null
        });
        var self = this;


        var postData = {
            SS: this.state.Rec.SS,
            Top: 0,
            RowCount: this.RowCount
        };

        Comm.Instance().post('admin/SearchUsers', postData).then(
            result => {
                self.setState({
                    Searching: false,
                    Rows: result.data,
                    Count: result.data && result.data.length > 0 ? result.data[0].Total : 0,
                    SearchSS: postData.SS
                });


            }).catch(
                function (response) {
                    console.log(response);
                    self.setState({
                        Searching: false
                    });
                }
            );

    }

    ShowMore() {
        var rec = this.state.Rec;
        rec.SS = this.state.SearchSS;
        var rows = this.state.Rows;


        this.setState({
            Searching: true,
            Rec: rec
        });
        var self = this;



        Axios.get('https://www.dir.bg').then(
            result => {

                var resultList = userlist;
                rows = rows.concat(userlist.rows);
                self.setState({
                    Searching: false,
                    Rows: rows,
                    Count: userlist.count,
                    SearchSS: userlist.ss
                });


            }).catch(
                function (response) {
                    console.log(response);
                    self.setState({
                        Searching: false
                    });
                }
            );

    }

    Edit(obj) {
        var rec = this.state.Rec;

        if (obj) {
            rec.id = obj.admUserID;
            rec.name = obj.name;
            rec.type = obj.userTypeID;
            rec.mail = obj.mail;
            rec.active = obj.active;

        }
        else {
            rec.id = null;
            rec.name = "";
            rec.type = "operator";
            rec.mail = "";
            rec.active = true;
        }

        this.setState({
            mode: "edit",
            Rec: rec
        });


    }
    async Save() {
        var self = this;
        if (self.state.Rec.name === "") {
            toast.error(self.T("namemandatory"));
            return;
        }

        if (self.state.Rec.id === null && (self.state.Rec.password || "") === "") {
            toast.error(self.T("passwordmandatory"));
            return;
        }

        if (!self.ValidateEmail(self.state.Rec.mail)) {
            toast.error(self.T("mailinvalid"));
            return;
        }

        var mailExists = true;
        if (!self.state.Rec.id)
            await Comm.Instance().get('admin/mailexists?mail=' + self.state.Rec.mail).then(
                result => {
                    mailExists = result.data;
                }).catch(
                    function (response) {
                        console.log(response);
                        self.setState({
                            Searching: false
                        });
                    }
                );
        else
            mailExists = false;
        if (mailExists) {
            toast.error(self.T("mailused"));
            return;
        }

        var postData = {
            AdmUserID: self.state.Rec.id,
            Name: self.state.Rec.name,
            UserTypeID: self.state.Rec.type,
            Mail: self.state.Rec.mail,
            Password: self.state.Rec.password,
            Active: this.state.Rec.active
        };
        if (postData.AdmUserID === null)
            Comm.Instance().post('admin/NewUser', postData).then(result => window.alert(result));
        else
            Comm.Instance().post('admin/SaveUser', postData);

        this.setState({
            mode: "search"
        });


    }

    Cancel() {
        this.setState({
            mode: "search"
        });
    }



    render() {
        var self = this;
        return (
            <div className="container-fluid mt-3" style={{ "overflow-y": "scroll" }}>
                {
                    self.state.mode === "edit" ?
                        [
                            <form autoComplete={false}>
                                <div className="row">
                                    <div className="col-12">
                                        <label className="control-label">{self.T("email")}</label>
                                        <input type="text" className="form-control" value={self.state.Rec.mail} id="mail" onChange={self.HandleChange} readOnly={self.state.Rec.id !== null} name="asdasdsa"></input>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <label className="control-label">{self.T("name")}</label>
                                        <input type="text" className="form-control" value={self.state.Rec.name} id="name" onChange={self.HandleChange}></input>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <label className="control-label">{self.T("password")}</label>
                                        <input type="password" className="form-control" value={self.state.Rec.password} id="password" onChange={self.HandleChange} autoComplete="new-password" ></input>
                                    </div>
                                </div>
                            </form>,
                            <div className="row">
                                <div className="col-12">
                                    <label className="control-label">{self.T("type")}</label>
                                    <select className="form-control" value={self.state.Rec.type} id="type" onChange={self.HandleChange}>
                                        <option value="operator">{self.T("operator")}</option>
                                        <option value="administrator">{self.T("administrator")}</option>
                                    </select>
                                </div>
                            </div>,
                            <div className="row">
                                <div className="col-12">
                                    <div class="checkbox">
                                        <label><input type="checkbox" id="active" onChange={self.HandleChange} checked={this.state.Rec.active} />{self.T("active")}</label>
                                    </div>
                                </div>
                            </div>,
                            <div className="row">
                                <div className="col-12">
                                    <button className="btn btn-primary" onClick={self.Save}>{self.T("ok")}</button>
                                    <button className="btn btn-danger" onClick={self.Cancel}>{self.T("cancel")}</button>
                                </div>
                            </div>
                        ] :
                        [
                            <div className="row">
                                <div className="col-8">
                                    <input type="text" className="form-control" value={self.state.Rec.SS} id="SS" onChange={self.HandleChange}></input>
                                </div>
                                <div className="col-2">
                                    <button className="btn btn-primary" onClick={self.Search}>{self.T("search")}</button>

                                </div>
                                <div className="col-2">
                                    <button className="btn btn-danger" onClick={() => self.Edit(null)}>{self.T("new")}</button>
                                </div>
                            </div>,
                            <div className="row">
                                <div className="col-12">
                                    {
                                        !self.state.Searching && self.state.Rows ?
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            {self.T("name")}
                                                        </th>
                                                        <th>
                                                            {self.T("email")}
                                                        </th>
                                                        <th>
                                                            {self.T("type")}
                                                        </th>
                                                        <th>
                                                            {self.T("active")}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        self.state.Rows.map(
                                                            (item, index) =>
                                                                <tr key={index}>
                                                                    <td>
                                                                        <a href="#" onClick={() => self.Edit(item)}>{item.name}</a>
                                                                    </td>
                                                                    <td>
                                                                        {item.mail}
                                                                    </td>
                                                                    <td>
                                                                        {self.TranslateIntoLanguage(item.userTypeID, self.SM.GetLanguage())}
                                                                    </td>
                                                                    <td>
                                                                        {item.active ? <i className="fas fa-check"></i> : null}
                                                                    </td>
                                                                </tr>
                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                            : null
                                    }
                                    {
                                        !self.state.Searching && self.state.Rows && self.state.Rows.length < self.state.Count ?
                                            <a href="#" onClick={self.ShowMore}>{self.T("showmore")}</a>
                                            : null
                                    }
                                    {
                                        self.state.Searching ? <Loader
                                            type="ThreeDots"
                                            color="#00BFFF"

                                            height="100"
                                            width="100"
                                        />
                                            : null
                                    }

                                </div>
                            </div>
                        ]
                }
            </div>
        );
    }

}
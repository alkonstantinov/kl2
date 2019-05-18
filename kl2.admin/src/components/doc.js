import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import BaseComponent from './basecomponent';
import eventClient from '../modules/eventclient';
import { Link } from 'react-router-dom';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Axios from 'axios';
import exampleDoc from '../data/exampledoc';
import nomenclatures from '../data/nomenclatures';
import Loader from 'react-loader-spinner';
import moment from 'moment';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import uuidv4 from 'uuid/v4';
import { toast } from 'react-toastify';
import MLEdit from '../visuals/mledit';
import {Tree} from 'primereact/tree';

class Doc extends BaseComponent {
    DocId = null;

    constructor(props) {
        super(props);
        eventClient.emit(
            "breadcrump",
            [{
                title: this.T("mainmenu")
            }]
        );


        this.ChangeVersion = this.ChangeVersion.bind(this);
        this.ShowSelectDateDialog = this.ShowSelectDateDialog.bind(this);
        this.AddNewVersion = this.AddNewVersion.bind(this);
        this.ChangeTitle = this.ChangeTitle.bind(this);
        this.GetCurrentVersion = this.GetCurrentVersion.bind(this);
        this.SetValueByVersion = this.SetValueByVersion.bind(this);
        this.SetValueCommon = this.SetValueCommon.bind(this);



        if (this.props.match.params.docId)
            this.DocId = this.props.match.params.docId;
        this.state.DocumentLoaded = false;
        this.state.NomenclaturesLoaded = false;
        this.state.Document = null;
        this.state.SelectDateDialogVisible = false;
    }


    ProcessDocument(doc) {
        doc.versions = doc.versions.sort(function (a, b) {
            return parseInt(b.dateStart) - parseInt(a.dateStart);
        });
        this.setState({
            Document: doc,
            CurrentVersionId: doc.versions[0].id,
            DisplayMode: "requisites"//requisites, content
        });
    }


    InitialiseDoc() {
        var self = this;



        if (this.DocId) {
            Axios.get('https://www.dir.bg').then(
                result => {
                    self.ProcessDocument(exampleDoc);

                }).catch(
                    function (response) {
                        console.log(response);
                    }
                );


        }
    }


    InitialiseNomenclatures() {
        var self = this;

        Axios.get('https://www.dir.bg').then(
            result => {
                this.setState({
                    Nomenclatures: nomenclatures,
                    NomenclaturesLoaded: true
                });

            }).catch(
                function (response) {
                    console.log(response);
                }
            );



    }


    componentDidMount() {
        this.InitialiseDoc();
        this.InitialiseNomenclatures();
    }


    ChangeVersion(e) {

        var state = { CurrentVersionId: e.target.value };
        this.setState(state);
    }

    ShowSelectDateDialog() {
        this.setState({ SelectDateDialogVisible: true });
    }



    AddNewVersion() {

        var prevVersion = null;
        var nextVersion = null;
        var newVersion = null;
        var date = moment(this.state.NewStartDate, "DD.MM.YYYY", true).format("YYYYMMDD");
        var newDoc = JSON.parse(JSON.stringify(this.state.Document));
        var error = false;
        newDoc.versions.forEach(element => {
            if (prevVersion === null && parseInt(element.dateStart) < parseInt(date))
                prevVersion = element;
            if (parseInt(element.dateStart) > parseInt(date))
                nextVersion = element;
            if (element.dateStart === date) {
                error = true;
            }
        });

        if (error) {
            toast.error(this.T("datealreadyexists"));
            return;
        }


        if (prevVersion) {
            prevVersion.dateEnd = date;
            newVersion = JSON.parse(JSON.stringify(prevVersion));
            newVersion.dateStart = date;
            newVersion.dateEnd = nextVersion ? nextVersion.dateStart : null;
        }
        else {
            newVersion = JSON.parse(JSON.stringify(nextVersion));
            newVersion.dateStart = date;
            newVersion.dateEnd = nextVersion ? nextVersion.dateStart : null;
        }
        newVersion.id = uuidv4();



        newDoc.versions.push(newVersion);
        newDoc.versions = newDoc.versions.sort(function (a, b) {
            return parseInt(b.dateStart) - parseInt(a.dateStart);
        });

        this.setState({
            SelectDateDialogVisible: false,
            Document: newDoc,
            CurrentVersionId: newVersion.id
        });

    }

    ChangeTitle(language, value) {
        var document = this.state.Document;
        document.versions.find(x => x.id == this.state.CurrentVersionId).title[language] = value;
        this.setState({ Document: document });

    }

    GetCurrentVersion() {
        return this.state.Document.versions.find(x => x.id === this.state.CurrentVersionId);
    }

    SetValueByVersion(property, value) {
        var document = this.state.Document;
        document.versions.find(x => x.id == this.state.CurrentVersionId)[property] = value;
        this.setState({ Document: document });
    }

    SetValueCommon(property, value) {
        var document = this.state.Document;
        document[property] = value;
        this.setState({ Document: document });
    }



    render() {
        var self = this;
        return (



            this.state.Document && this.state.NomenclaturesLoaded ?
                <div className="container mt-3">
                    <div className="row">
                        <div className="col-3">
                            <div className="row border">
                                <div className="col-12">
                                    <label className="control-label">
                                        {self.T("versions")}
                                    </label>
                                    <select className="form-control" onChange={(e) => self.ChangeVersion(e)} value={self.state.CurrentVersionId} id="SelectedVersion">
                                        {
                                            self.state.Document.versions.map((obj, i) => <option key="" value={obj.id}>{moment(obj.dateStart, 'YYYYMMDD').format('DD.MM.YYYY')}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="col-12">
                                    <button className="btn btn-danger" onClick={self.ShowSelectDateDialog}>{self.T("newversion")}</button>
                                </div>
                            </div>
                            <div className="row border">
                                <div className="col-12">
                                    <button className="btn btn-light" onClick={() => self.setState({ DisplayMode: "requisites" })}>{self.T("requisites")}</button>
                                </div>
                            </div>


                        </div>
                        {self.state.DisplayMode === "requisites" ?
                            <div className="col-9  border">
                                <div className="row border">
                                    <div className="col-2">
                                        <label className="control-label">{self.T("startdate")}</label>
                                    </div>
                                    <div className="col-4">
                                        {moment(self.GetCurrentVersion().dateStart, 'YYYYMMDD').format('DD.MM.YYYY')}
                                    </div>
                                    <div className="col-2">
                                        <label className="control-label">{self.T("enddate")}</label>
                                    </div>
                                    <div className="col-4">
                                        {
                                            self.GetCurrentVersion().dateEnd ?
                                                moment(self.GetCurrentVersion().dateEnd, 'YYYYMMDD').format('DD.MM.YYYY')
                                                : <button className="btn btn-danger" onClick={self.ShowSelectDateDialog}>{self.T("stop")}</button>
                                        }
                                    </div>
                                </div>
                                <div className="row border">
                                    <div className="col-2">
                                        <label className="control-label">{self.T("title")}</label>
                                    </div>
                                    <div className="col-10">
                                        <MLEdit prefix="title" parent={self.GetCurrentVersion().title} change={self.ChangeTitle}></MLEdit>
                                    </div>
                                </div>
                                <div className="row border">
                                    <div className="col-3">
                                        <label className="control-label">
                                            {self.T("documenttype")}
                                        </label>
                                    </div>
                                    <div className="col-9">
                                        <select className="form-control" onChange={(e) => self.SetValueCommon("documenttype", e.target.value)} value={self.state.Document.documenttype}>
                                            {
                                                self.state.Nomenclatures.doctypes.map((obj, i) => <option key="" value={obj.id}>{obj[self.SM.GetLanguage()]}</option>)
                                            }
                                        </select>
                                    </div>

                                </div>
                                <div className="row border">
                                    <div className="col-3">
                                        <label className="control-label">
                                            {self.T("issuer")}
                                        </label>
                                    </div>
                                    <div className="col-9">
                                        <select className="form-control" onChange={(e) => self.SetValueCommon("issuer", e.target.value)} value={self.state.Document.issuer}>
                                            {
                                                self.state.Nomenclatures.issuers.map((obj, i) => <option key="" value={obj.id}>{obj[self.SM.GetLanguage()]}</option>)
                                            }
                                        </select>
                                    </div>

                                </div>
                                <div className="row border">
                                    <div className="col-3">
                                        <label className="control-label">
                                            {self.T("documentnumber")}
                                        </label>
                                    </div>
                                    <div className="col-9">
                                        <input type="text" className="form-control" onChange={(e) => self.SetValueCommon("documentnumber", e.target.value)} value={self.state.Document.documentnumber}></input>
                                    </div>
                                </div>

                            </div>
                            : null
                        }
                    </div>


                    <Dialog header={self.T("selectstartdate")} visible={this.state.SelectDateDialogVisible} style={{ width: '50vw' }} modal={true} onHide={() => self.setState({ SelectDateDialogVisible: false })}>
                        <div className="row">
                            <div className="col-3">
                                {self.T("startdate")}
                            </div>
                            <div className="col-3">
                                <Calendar dateFormat="dd.mm.yy" value={self.state.NewStartDate} onChange={(e) => self.setState({ NewStartDate: e.value })}></Calendar>
                            </div>
                            <div className="col-3">
                                {
                                    moment(self.state.NewStartDate, "DD.MM.YYYY", true).isValid() ?
                                        <button className="btn btn-danger" onClick={self.AddNewVersion}>{self.T("newversion")}</button>
                                        : null
                                }
                            </div>
                            <div className="col-3">
                                <button className="btn btn-default" onClick={() => self.setState({ SelectDateDialogVisible: false })}>{self.T("cancel")}</button>
                            </div>
                        </div>
                    </Dialog>
                </div >

                :
                <Loader
                    type="ThreeDots"
                    color="#00BFFF"

                    height="100"
                    width="100"
                />

        )
    }
}

export default Doc;
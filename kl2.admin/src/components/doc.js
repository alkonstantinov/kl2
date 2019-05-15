import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import BaseComponent from './basecomponent';
import eventClient from '../modules/eventclient';
import { Link } from 'react-router-dom';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Axios from 'axios';
import exampleDoc from '../data/exampledoc';
import Loader from 'react-loader-spinner';
import moment from 'moment';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import uuidv4 from 'uuid/v4';
import { toast } from 'react-toastify';

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


        if (this.props.match.params.docId)
            this.DocId = this.props.match.params.docId;
        this.state.DocumentLoaded = false;
        this.state.Document = null;
        this.state.SelectDateDialogVisible = false;
    }


    ProcessDocument(doc) {
        doc.versions = doc.versions.sort(function (a, b) {
            return parseInt(b.dateStart) - parseInt(a.dateStart);
        });
        this.setState({ Document: doc });
    }


    InitialiseDoc() {
        var self = this;
        this.ShowSpin();


        if (this.DocId) {
            Axios.get('https://www.dir.bg').then(
                result => {
                    self.ProcessDocument(exampleDoc);
                    self.HideSpin();
                }).catch(
                    function (response) {
                        console.log(response);
                    }
                );


        }
    }


    componentDidMount() {
        this.InitialiseDoc();
    }


    ChangeVersion(e) {
        var state = { SelectedVersion: e.target.value };
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

        if (error){
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
            Document: newDoc
        });

    }

    render() {
        var self = this;
        return (

            this.state.spinner === true ?
                <Loader
                    type="ThreeDots"
                    color="#00BFFF"

                    height="100"
                    width="100"
                /> :
                this.state.Document ?

                    <div className="container mt-3">
                        <div className="col-3">
                            <div className="col-12">
                                <label className="control-label">
                                    {self.T("versions")}
                                </label>
                                <select className="form-control" onChange={(e) => self.ChangeVersion(e)} value={self.state.Rec.SelectedVersion} id="SelectedVersion">
                                    {
                                        self.state.Document.versions.map((obj, i) => <option key="" value={obj.id}>{moment(obj.dateStart, 'YYYYMMDD').format('DD.MM.YYYY')}</option>)
                                    }
                                </select>
                            </div>
                            <div className="col-12">
                                <button className="btn btn-danger" onClick={self.ShowSelectDateDialog}>{self.T("newversion")}</button>
                            </div>



                        </div>
                        <div className="col-9">


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
                    </div>

                    :
                    null

        )
    }
}

export default Doc;
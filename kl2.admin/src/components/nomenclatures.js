import React from 'react';
import eventClient from '../modules/eventclient';
import BaseComponent from './basecomponent';
import { SelectButton } from 'primereact/selectbutton';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import { Tree } from 'primereact/tree';
import categories from '../data/categories.json';
import Axios from 'axios';
import Loader from 'react-loader-spinner';
import Languages from '../data/languages';
import uuidv4 from 'uuid/v4';
import MLEdit from '../visuals/mledit';
import { toast } from 'react-toastify';
import nomenclatures from '../data/nomenclatures';
import Comm from '../modules/comm';


export default class Nomenclatures extends BaseComponent {


    constructor(props) {
        super(props);
        eventClient.emit(
            "breadcrump",
            [{
                title: this.T("mainmenu"),
                href: ""
            },
            {
                title: this.T("nomenclatures")
            }]
        );
        this.ReloadData = this.ReloadData.bind(this);
        this.SelectItem = this.SelectItem.bind(this);
        this.ChangeTitle = this.ChangeTitle.bind(this);
        this.Delete = this.Delete.bind(this);
        this.NewItem = this.NewItem.bind(this);
        this.SaveToDB = this.SaveToDB.bind(this);
        this.ChangeNomen = this.ChangeNomen.bind(this);
        

        this.state.nomenclature = "issuers";
        this.state.selectedId = null;


    }





    ReloadData(nomen) {
        var self = this;

        Comm.Instance().get('admin/GetJSON').then(
            result => {

                var data = [];
                var wholeJSON = result.data;
                wholeJSON.forEach(x => x.jsonData = JSON.parse(x.jsonData));
                switch (nomen) {
                    case "issuers": data = wholeJSON.find(x => x.jsonType === "issuers").jsonData; break;
                    case "doctypes": data = wholeJSON.find(x => x.jsonType === "doctypes").jsonData; break;
                    default: break;

                }
                self.setState({
                    wholeJSON: wholeJSON,
                    data: data,
                    selectedId: null
                });

            }).catch(
                function (response) {
                    console.log(response);
                }
            );

    }


    ChangeNomen(nomen) {
        var data = [];
        switch (nomen) {
            case "issuers": data = this.state.wholeJSON.find(x => x.jsonType === "issuers").jsonData; break;
            case "doctypes": data = this.state.wholeJSON.find(x => x.jsonType === "doctypes").jsonData; break;
            default: break;

        }
        this.setState({
            data: data,
            selectedId: null,
            nomenclature: nomen
        });
    }

    componentDidMount() {
        this.ReloadData(this.state.nomenclature);

    }


    
    SelectItem(id) {
        this.setState({
            selectedId: id
        });
    }

    ChangeTitle(language, value) {
        var data = this.state.data;
        data.find(x => x.id === this.state.selectedId).title[language] = value;
        this.setState({
            data: data
        });
    }

    Delete(i) {
        var data = this.state.data;
        data.splice(i, 1);
        this.setState({
            data: data,
            selectedId: null
        });
    }

    NewItem() {
        var data = this.state.data;
        var id = uuidv4();
        var item = {
            id: id,
            title: {}
        };
        var self = this;
        Languages.forEach(x => item.title[x.key] = self.TranslateIntoLanguage("newitem", x.key));

        data.push(item);
        this.setState({
            data: data,
            selectedId: id
        });
    }

    SaveToDB() {
        var self = this;

        var postData = JSON.parse(JSON.stringify(this.state.wholeJSON));
        postData.forEach(x => x.jsonData = JSON.stringify(x.jsonData));


        Comm.Instance().post('admin/UpdateJSON', postData).then(
            result => {


                toast.info(self.T("datasaved"));



            }).catch(
                function (response) {
                    toast.error(response);
                }
            );
    }



    render() {
        var self = this;
        return (
            this.state.data ?
                <div className="container-fluid mt-3">
                    <div className="row">
                        <div className="col-2">
                            <button className="btn btn-default" onClick={self.NewItem}>{self.T("new")}</button>
                        </div>
                        <div className="col-2">
                            <button className="btn btn-primary" onClick={self.SaveToDB}>{self.T("save")}</button>
                        </div>
                        <div className="col-2">
                            <select className="form-control" value={self.state.nomenclature} onChange={(e) => self.ChangeNomen(e.target.value)}>
                                <option value="issuers">{self.T("issuers")}</option>
                                <option value="doctypes">{self.T("doctypes")}</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-4">
                            <ul className="list-group">
                                {
                                    self.state.data.map((obj, i) =>
                                        <li className={self.state.selectedId === obj.id ? "list-group-item active" : "list-group-item"} >
                                            <span onClick={() => self.SelectItem(obj.id)}>{obj.title[self.SM.GetLanguage()]}</span>&nbsp;
                                            <i className="fas fa-trash-alt" onClick={() => self.Delete(i)}></i>
                                        </li>
                                    )
                                }
                            </ul>

                        </div>
                        <div className="col-4">
                            {
                                self.state.selectedId ?
                                    <MLEdit prefix="title" parent={self.state.data.find(x => x.id === self.state.selectedId).title} change={self.ChangeTitle}></MLEdit>
                                    : null
                            }
                        </div>
                    </div>
                </div>
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


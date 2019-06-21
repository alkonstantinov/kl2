import React from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import BaseComponent from './basecomponent';
import { Tree } from 'primereact/tree';
import Axios from 'axios';
import Loader from 'react-loader-spinner';
import documentlist from '../data/documentlist.json';
import moment from 'moment';
import eventClient from '../modules/eventclient';
import uuidv4 from 'uuid/v4';
import Comm from '../modules/comm';

export default class DocumentSearch extends BaseComponent {

    expandedNodes;
    constructor(props) {
        super(props);
        eventClient.emit(
            "breadcrump",
            [{
                title: this.T("mainmenu"),
                href: ""
            },
            {
                title: this.T("documents")
            }]
        )

        this.CreateExpandedNodes = this.CreateExpandedNodes.bind(this);
        this.DocumentElementTemplate = this.DocumentElementTemplate.bind(this);
        this.ChangeSelectedNode = this.ChangeSelectedNode.bind(this);
        this.Search = this.Search.bind(this);
        this.ShowUnpublished = this.ShowUnpublished.bind(this);
        this.NewDocument = this.NewDocument.bind(this);
        this.Delete = this.Delete.bind(this);


        this.state.Searching = false;
    }


    CreateExpandedNodes(elementFromJSON, ExpandedNodes) {

        ExpandedNodes[elementFromJSON.key] = true;
        var self = this;
        elementFromJSON.children.forEach(x =>
            self.CreateExpandedNodes(x, ExpandedNodes)
        );
    }


    componentDidMount() {
        var self = this;
        Comm.Instance().get('admin/GetJSON?jsonType=categories').then(
            result => {

                var treeJSON = JSON.parse(result.data[0].jsonData);

                self.expandedNodes = { "-1": true };
                treeJSON = [{
                    key: "-1",
                    label: this.T("categories"),
                    data: {},
                    children: treeJSON
                }];


                this.CreateExpandedNodes(treeJSON[0], self.expandedNodes);

                self.setState({
                    TreeJSON: treeJSON,
                    SelectedNodeId: "-1",
                    ExpandedNodes: self.expandedNodes
                });


            }).catch(
                function (response) {
                    console.log(response);
                }
            );





    }

    DocumentElementTemplate(node) {

        if (node.key == "-1")
            return (<span>
                {this.TranslateIntoLanguage("categories", this.SM.GetLanguage())}
            </span>);
        else
            return (<span>
                {node.data[this.SM.GetLanguage()]}
            </span>);

    }

    ChangeSelectedNode(nodeId) {
        var rec = this.state.Rec;
        rec.SS = "";
        this.setState({
            SelectedNodeId: nodeId,
            Searching: nodeId != "-1",
            Rec: rec
        });
        var self = this;

        if (nodeId != "-1") {
            var postData = { SS: nodeId };

            Comm.Instance().post('admin/SearchDocument', postData).then(
                result => {

                    var resultList = result.data;
                    resultList.forEach(x => x.documentData = JSON.parse(x.documentData));
                    self.setState({
                        Searching: false,
                        DocumentList: resultList
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
    }


    Search() {

        this.setState({
            SelectedNodeId: "-1",
            Searching: true
        });
        var self = this;



        var postData = { SS: self.state.Rec.SS, LimitResult: 100 };

        Comm.Instance().post('admin/SearchDocument', postData).then(
            result => {

                var resultList = result.data;
                resultList.forEach(x => x.documentData = JSON.parse(x.documentData));
                self.setState({
                    Searching: false,
                    DocumentList: resultList
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


    ShowUnpublished() {
        var rec = this.state.Rec;
        rec.SS = "";
        this.setState({
            SelectedNodeId: "-1",
            Searching: true,
            Rec: rec

        });
        var self = this;



        Comm.Instance().get('admin/UnpublishedDocuments').then(
            result => {

                var resultList = result.data;
                resultList.forEach(x => x.documentData = JSON.parse(x.documentData));
                self.setState({
                    Searching: false,
                    DocumentList: resultList
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

    NewDocument() {
        var newId = uuidv4();

        var document = {
            "id": newId,
            "leadId": uuidv4(),
            "title": {
                "en": ""
            },
            "paragraphs": {

            },
            "rootParagraphs": [

            ]
        };
        var self = this;
        Axios.get("https://www.dir.bg")
            .then(result => {
                self.setState({ ShowNewVer: newId })

            })
            .catch(
                response => console.log(response)

            )
    }

    Delete(id, i) {
        var self = this;
        Comm.Instance().get('admin/DeleteDOCUMENT?documentId=' + id)
            .then(result => {
                var dl = self.state.DocumentList;
                dl.splice(i, 1);
                self.setState({ DocumentList: dl })

            })
            .catch(
                response => console.log(response)

            )
    }

    render() {
        var self = this;
        return (
            self.state.ShowNewVer ?
                <Redirect to={"/newdoc/" + self.state.ShowNewVer} push></Redirect>
                :
                <div className="container-fluid mt-3">
                    <div className="row">
                        <div className="col-5">
                            {
                                self.state.TreeJSON ?
                                    <Tree
                                        selectionMode="single"
                                        value={self.state.TreeJSON}
                                        style={{ marginTop: '.5em', width: '100%' }}
                                        nodeTemplate={self.DocumentElementTemplate}
                                        expandedKeys={self.state.ExpandedNodes}
                                        selectionKeys={self.state.SelectedNodeId}
                                        onSelectionChange={e =>
                                            self.ChangeSelectedNode(e.value)
                                        }

                                    />
                                    : null
                            }

                        </div>
                        <div className="col-7">
                            <div className="row">
                                <div className="col-6">
                                    <input type="text" className="form-control" value={self.state.Rec.SS} id="SS" onChange={self.HandleChange}></input>
                                </div>
                                <div className="col-2">

                                    <button className="btn btn-primary" onClick={self.Search}>{self.T("search")}</button>


                                </div>
                                <div className="col-2">
                                    <button className="btn btn-primary" onClick={self.NewDocument}>{self.T("new")}</button>
                                </div>

                                <div className="col-2">
                                    <button className="btn btn-danger" onClick={self.ShowUnpublished}>{self.T("unpublished")}</button>
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-12">
                                    {
                                        self.state.Searching ? <Loader
                                            type="ThreeDots"
                                            color="#00BFFF"

                                            height="100"
                                            width="100"
                                        />
                                            :
                                            self.state.DocumentList ?
                                                self.state.DocumentList.length === 0 ?
                                                    <div className="alert alert-danger">{self.T("notfound")}</div> :
                                                    <table className="table table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th>
                                                                    {self.T("title")}
                                                                </th>
                                                                <th>
                                                                    {self.T("annulled")}
                                                                </th>
                                                                <th>
                                                                    {self.T("fromdate")}
                                                                </th>
                                                                <th>
                                                                    {self.T("todate")}
                                                                </th>
                                                                <th>
                                                                    {self.T("publish")}
                                                                </th>
                                                                <th>

                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                self.state.DocumentList.map(
                                                                    (item, i) =>
                                                                        <tr>
                                                                            <td>

                                                                                <Link to={'/doc/' + item.documentData.id}>
                                                                                    {item.documentData.title[self.SM.GetLanguage()]}
                                                                                </Link>

                                                                            </td>
                                                                            <td>
                                                                                {item.documentData.annulled ? <i class="fas fa-check"></i> : null}
                                                                            </td>
                                                                            <td>
                                                                                {item.documentData.dateStart ? moment(item.documentData.dateStart, "YYYYMMDD").format("DD.MM.YYYY") : null}
                                                                            </td>
                                                                            <td>
                                                                                {item.documentData.dateEnd ? moment(item.documentData.dateEnd, "YYYYMMDD").format("DD.MM.YYYY") : null}
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    item.publishDate && item.publishDate < item.editDate ?
                                                                                        <i className="fas fa-upload"></i>
                                                                                        : null
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                <i className="fas fa-trash-alt" onClick={() => self.Delete(item.documentData.id, i)}></i>

                                                                            </td>
                                                                        </tr>
                                                                )
                                                            }
                                                        </tbody>
                                                    </table>
                                                : null
                                    }

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
        )
    }

}
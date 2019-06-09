import React from 'react';
import { Link } from 'react-router-dom';
import BaseComponent from './basecomponent';
import { Tree } from 'primereact/tree';
import Axios from 'axios';
import categories from '../data/categories.json';
import Loader from 'react-loader-spinner';
import documentlist from '../data/documentlist.json';
import moment from 'moment';
import eventClient from '../modules/eventclient';

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

        Axios.get('https://www.dir.bg').then(
            result => {

                var treeJSON = categories;
                self.expandedNodes = { "-1": true };
                var treeJSON = [{
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

            Axios.get('https://www.dir.bg').then(
                result => {

                    var resultList = documentlist;
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
        var rec = this.state.Rec;

        this.setState({
            SelectedNodeId: "-1",
            Searching: true
        });
        var self = this;



        Axios.get('https://www.dir.bg').then(
            result => {

                var resultList = documentlist;
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



        Axios.get('https://www.dir.bg').then(
            result => {

                var resultList = documentlist;
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

    render() {
        var self = this;
        return (

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
                            <div className="col-8">
                                <input type="text" className="form-control" value={self.state.Rec.SS} id="SS" onChange={self.HandleChange}></input>
                            </div>
                            <div className="col-2">
                                {
                                    self.state.Rec.SS && self.state.Rec.SS !== "" ?
                                        <button className="btn btn-primary" onClick={self.Search}>{self.T("search")}</button>
                                        : null
                                }

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
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        self.state.DocumentList.map(
                                                            item =>
                                                                <tr>
                                                                    <td>

                                                                        <Link to={'/doc/' + item.id}>
                                                                            {item.title[self.SM.GetLanguage()]}
                                                                        </Link>

                                                                    </td>
                                                                    <td>
                                                                        {item.annulled ? <i class="fas fa-check"></i> : null}
                                                                    </td>
                                                                    <td>
                                                                        {item.fromDate ? moment(item.fromDate, "YYYYMMDD").format("DD.MM.YYYY") : null}
                                                                    </td>
                                                                    <td>
                                                                        {item.toDate ? moment(item.toDate, "YYYYMMDD").format("DD.MM.YYYY") : null}
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            item.canPublish ?
                                                                                <i class="fas fa-upload"></i>
                                                                                : null
                                                                        }
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
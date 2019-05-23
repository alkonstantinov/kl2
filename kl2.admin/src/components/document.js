import React from 'react';
import BaseComponent from './basecomponent';
import eventClient from '../modules/eventclient';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Axios from 'axios';
import exampleDoc from '../data/exampledoc';
import nomenclatures from '../data/nomenclatures';
import Loader from 'react-loader-spinner';
import moment from 'moment';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import uuidv4 from 'uuid/v4';
import MLEdit from '../visuals/mledit';
import { Tree } from 'primereact/tree';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { PanelMenu } from 'primereact/panelmenu';
import Languages from '../data/languages';

class Document extends BaseComponent {
    DocId = null;

    constructor(props) {
        super(props);
        eventClient.emit(
            "breadcrump",
            [{
                title: this.T("mainmenu")
            }]
        );

        this.ChangeTitle = this.ChangeTitle.bind(this);
        this.ChangeSelectedNode = this.ChangeSelectedNode.bind(this);
        this.CreateTree = this.CreateTree.bind(this);
        this.MovePart = this.MovePart.bind(this);
        this.DeletePart = this.DeletePart.bind(this);
        this.ConstructAddMenu = this.ConstructAddMenu.bind(this);
        this.AddPart = this.AddPart.bind(this);


        if (this.props.match.params.docId)
            this.DocId = this.props.match.params.docId;
        this.state.DocumentLoaded = false;
        this.state.NomenclaturesLoaded = false;
        this.state.Document = null;
        this.state.SelectDateDialogVisible = false;


    }





    InitialiseDoc() {
        var self = this;



        if (this.DocId) {

            Axios.get('https://www.dir.bg').then(
                result => {

                    self.Child2Parent = {};
                    var doc = exampleDoc;
                    var expandedNodes = { "-1": true };

                    Object.keys(doc.paragraphs).forEach(item => expandedNodes[item] = true);

                    this.setState({
                        Document: exampleDoc,
                        DisplayMode: "requisites", //requisites, content,
                        TreeData: [{
                            key: "-1",
                            label: self.T("document"),
                            data: {},
                            children: doc.rootParagraphs.map(item => this.CreateTree(doc, item, null))
                        }],
                        AddMenu: this.ConstructAddMenu("-1"),
                        SelectedNodeId: "-1",
                        ExpandedNodes: expandedNodes
                    });

                }).catch(
                    function (response) {
                        console.log(response);
                    }
                );


        }
    }


    InitialiseNomenclatures() {

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


    ShowSelectDateDialog() {
        this.setState({ SelectDateDialogVisible: true });
    }





    ChangeTitle(language, value) {
        var document = this.state.Document;
        document.title[language] = value;
        this.setState({ Document: document });

    }



    SetValueCommon(property, value) {
        var document = this.state.Document;
        document[property] = value;
        this.setState({ Document: document });
    }


    CreateTree(document, id, parent) {

        var children = (parent === null ? document.rootParagraphs : document.paragraphs[parent].children);
        this.Child2Parent[id] = {
            parent: parent,
            isFirst: children[0] === id,
            isLast: children[children.length - 1] === id
        };

        let element = Object.create(null);
        element.key = id;
        element.label = document.paragraphs[id].title[this.SM.GetLanguage()];
        element.data = Object.assign({}, document.paragraphs[id]);
        element.children = [];
        document.paragraphs[id].children.forEach(x =>
            element.children.push(this.CreateTree(document, x, id))
        );
        return element;
    }

    DocumentElementTemplate(node) {

        return (<span>
            {node.label}
        </span>);
    }


    ChangeSelectedNode(nodeId) {
        this.setState({
            SelectedNodeId: nodeId,
            AddMenu: this.ConstructAddMenu(nodeId)
        });
    }

    MovePart(up) {
        var parent = this.Child2Parent[this.state.SelectedNodeId].parent;
        var document = this.state.Document;
        var children = (parent === null ? document.rootParagraphs : document.paragraphs[parent].children);
        var myPos = children.indexOf(this.state.SelectedNodeId);
        var otherPos = (up ? myPos - 1 : myPos + 1);
        var pom = children[myPos];
        children[myPos] = children[otherPos];
        children[otherPos] = pom;
        this.Child2Parent = {};
        var self = this;
        this.setState({
            Document: document,
            DisplayMode: "requisites", //requisites, content,
            TreeData: [{
                key: "-1",
                label: self.T("document"),
                data: null,
                children: document.rootParagraphs.map(item => this.CreateTree(document, item, null))
            }]
        });

    }

    DeletePart() {
        var parent = this.Child2Parent[this.state.SelectedNodeId].parent;
        var document = this.state.Document;
        var children = (parent === null ? document.rootParagraphs : document.paragraphs[parent].children);
        var myPos = children.indexOf(this.state.SelectedNodeId);
        children.splice(myPos, 1);
        delete document.paragraphs[this.state.SelectedNodeId];
        this.Child2Parent = {};
        var nodeId = document.rootParagraphs.length > 0 ? document.rootParagraphs[0] : null
        var self = this;
        this.setState({
            Document: document,
            DisplayMode: "requisites", //requisites, content,
            SelectedNodeId: nodeId,
            AddMenu: this.ConstructAddMenu(nodeId),
            TreeData: [{
                key: "-1",
                label: self.T("document"),
                data: null,
                children: document.rootParagraphs.map(item => this.CreateTree(document, item, null))
            }]
        });
    }


    ConstructAddMenu(nodeId) {
        if (!nodeId)
            return null;
        var menuContent = [{
            label: this.T("add"),
            items: []
        }];

        var self = this;
        var part = {
            label: this.T("part"),
            command: () => self.AddPart("part")
        }
        var article = {
            label: this.T("article"),
            command: () => self.AddPart("article")
        }
        var alinea = {
            label: this.T("alinea"),
            command: () => self.AddPart("alinea")
        }
        var text = {
            label: this.T("text"),
            command: () => self.AddPart("text")
        }

        if (nodeId === "-1") {
            menuContent[0].items.push(part);
            menuContent[0].items.push(article);
            menuContent[0].items.push(text);
        }
        else {

            switch (this.state.Document.paragraphs[nodeId].type) {
                case "part":
                    menuContent[0].items.push(article);
                    menuContent[0].items.push(text);
                    break;
                case "article":
                    menuContent[0].items.push(alinea);
                    break;
                default: break;

            }
        }

        return menuContent;
    }



    AddPart(part) {
        var self = this;
        var id = uuidv4();
        var paragraph = {
            "title": {
            },
            "type": part,
            "text": {
            },
            "children": []
        };
        Languages.forEach(item => {
            paragraph.title[item.key] = self.TranslateIntoLanguage(part, item.key);
            paragraph.text[item.key] = "";
        });
        var document = this.state.Document;
        if (this.state.SelectedNodeId === "-1")
            document.rootParagraphs.push(id);
        else
            document.paragraphs[this.state.SelectedNodeId].children.push(id);
        document.paragraphs[id] = paragraph;
        this.Child2Parent = {};
        var expandedNodes = this.state.ExpandedNodes;
        expandedNodes[id] = true;
        this.setState({
            Document: document,
            SelectedNodeId: id,
            AddMenu: this.ConstructAddMenu(id),
            TreeData: [{
                key: "-1",
                label: self.T("document"),
                data: null,
                children: document.rootParagraphs.map(item => this.CreateTree(document, item, null))
            }],
            ExpandedNodes: expandedNodes
        });

    }


    render() {
        var self = this;
        return (



            this.state.Document && this.state.NomenclaturesLoaded ?
                <div className="container-fluid mt-3">
                    <div className="row">
                        <div className="col-3">
                            <div className="row border">

                                <div className="col-12">
                                    <button className="btn btn-danger" onClick={self.ShowSelectDateDialog}>{self.T("newversion")}</button>
                                </div>
                            </div>
                            <div className="row border">
                                <div className="col-12">
                                    <button className="btn btn-light" onClick={() => self.setState({ DisplayMode: "requisites" })}>{self.T("requisites")}</button>
                                </div>
                            </div>

                            {
                                self.state.SelectedNodeId ?

                                    <div className="row border">
                                        <div className="col-2 align-middle">
                                            {
                                                self.Child2Parent[self.state.SelectedNodeId] &&
                                                    !self.Child2Parent[self.state.SelectedNodeId].isFirst ? <button className="btn btn-light" onClick={() => self.MovePart(true)}><i class="fas fa-sort-up fa-lg"></i></button> : null
                                            }


                                        </div>
                                        <div className="col-2 align-middle">
                                            {
                                                self.Child2Parent[self.state.SelectedNodeId] &&
                                                    !self.Child2Parent[self.state.SelectedNodeId].isLast ? <button className="btn btn-light" onClick={() => self.MovePart(false)}><i class="fas fa-sort-down fa-lg"></i></button> : null
                                            }
                                        </div>
                                        <div className="col-2">
                                            {
                                                self.state.Document.paragraphs[self.state.SelectedNodeId] &&
                                                    self.state.Document.paragraphs[self.state.SelectedNodeId].children.length === 0 ? <button className="btn btn-light" onClick={() => self.DeletePart()}><i class="fas fa-trash fa-lg"></i></button> : null}
                                        </div>
                                        <div className="col-6">
                                            <PanelMenu model={self.state.AddMenu} style={{ 'width': '100%' }} />
                                        </div>

                                    </div>
                                    : null
                            }
                            <div className="row border">
                                <div className="col-12">
                                    <Tree
                                        selectionMode="single"
                                        value={self.state.TreeData}
                                        style={{ marginTop: '.5em', width: '100%' }}
                                        nodeTemplate={self.DocumentElementTemplate}
                                        expandedKeys={self.state.ExpandedNodes}
                                        selectionKeys={self.state.SelectedNodeId}
                                        onSelectionChange={e =>
                                            self.ChangeSelectedNode(e.value)
                                        }

                                    />
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
                                        {moment(self.state.Document.dateStart, 'YYYYMMDD').format('DD.MM.YYYY')}
                                    </div>
                                    <div className="col-2">
                                        <label className="control-label">{self.T("enddate")}</label>
                                    </div>
                                    <div className="col-4">
                                        {
                                            self.state.Document.dateEnd ?
                                                moment(self.state.Document.dateEnd, 'YYYYMMDD').format('DD.MM.YYYY')
                                                : <button className="btn btn-danger" onClick={self.ShowSelectDateDialog}>{self.T("stop")}</button>
                                        }
                                    </div>
                                </div>
                                <div className="row border">
                                    <div className="col-2">
                                        <label className="control-label">{self.T("title")}</label>
                                    </div>
                                    <div className="col-10">
                                        <MLEdit prefix="title" parent={self.state.Document.title} change={self.ChangeTitle}></MLEdit>
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
                                                self.state.Nomenclatures.doctypes.map((obj, i) => <option key={i} value={obj.id}>{obj[self.SM.GetLanguage()]}</option>)
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
                                                self.state.Nomenclatures.issuers.map((obj, i) => <option key={i} value={obj.id}>{obj[self.SM.GetLanguage()]}</option>)
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

export default Document;
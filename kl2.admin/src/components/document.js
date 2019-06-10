import React from 'react';
import { Redirect } from 'react-router-dom';
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
import PartEdit from '../visuals/partedit';
import DocSelect from '../visuals/docselect';
import docpartresponse from '../data/docpartresponse';
import CategoriesSelect from '../visuals/categoriesselect';
import { toast } from 'react-toastify';

class Document extends BaseComponent {
    DocId = null;

    constructor(props) {
        super(props);
        eventClient.emit(
            "breadcrump",
            [{
                title: this.T("mainmenu"),
                href: ""
            },
            {
                title: this.T("documents"),
                href: "documentsearch"
            },
            {
                title: this.T("users")
            }]
        )
        this.ChangeTitle = this.ChangeTitle.bind(this);
        this.ChangeSelectedNode = this.ChangeSelectedNode.bind(this);
        this.CreateTree = this.CreateTree.bind(this);
        this.MovePart = this.MovePart.bind(this);
        this.DeletePart = this.DeletePart.bind(this);
        this.ConstructAddMenu = this.ConstructAddMenu.bind(this);
        this.AddPart = this.AddPart.bind(this);
        this.SetSelectedNodeProperty = this.SetSelectedNodeProperty.bind(this);
        this.GetSelectedNodeProperty = this.GetSelectedNodeProperty.bind(this);
        this.ShowSelectDateDialog = this.ShowSelectDateDialog.bind(this);
        this.SelectDocumentPart = this.SelectDocumentPart.bind(this);
        this.GetCitedDocumentFromServer = this.GetCitedDocumentFromServer.bind(this);
        this.AnnulleDocument = this.AnnulleDocument.bind(this);
        this.AnnullePart = this.AnnullePart.bind(this);
        this.SetCategories = this.SetCategories.bind(this);
        this.Save = this.Save.bind(this);
        this.CreateNewVersion = this.CreateNewVersion.bind(this);
        
        this.dsDoc = React.createRef();
        this.csCategories = React.createRef();

        if (this.props.match.params.docId)
            this.DocId = this.props.match.params.docId;
        this.state.DocumentLoaded = false;
        this.state.NomenclaturesLoaded = false;
        this.state.Document = null;
        this.state.SelectDateDialogVisible = false;
        this.state.SelectDocumentVisible = false;
        this.state.SelectCategoriesVisible = false;




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

                    this.GetCitedDocumentFromServer(doc.annulledDocInfo, 1);

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
        this.refs.dsDoc.current.GoToStart();

        this.setState({ SelectDocumentVisible: true });
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
            AddMenu: this.ConstructAddMenu(nodeId),
            DisplayMode: nodeId !== "-1" ? "structure" : "requisites"
        });
        this.GetCitedDocumentFromServer(this.state.Document.paragraphs[nodeId].annulledDocInfo, 2);
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


    GetSelectedNodeProperty(lang, prop) {
        var doc = this.state.Document;
        if (lang)
            return doc.paragraphs[this.state.SelectedNodeId][prop][lang];
        else
            return doc.paragraphs[this.state.SelectedNodeId][prop];
    }

    SetSelectedNodeProperty(lang, prop, value) {
        var doc = this.state.Document;
        doc.paragraphs[this.state.SelectedNodeId][prop][lang] = value;
        this.setState({ Document: doc });
    }


    SelectDocumentPart(id, partid) {
        if (this.state.AnnulleMode === 1) {
            var doc = this.state.Document;
            doc.annulledDocInfo = {
                id: id,
                partid: partid
            };

            this.setState({
                SelectDocumentVisible: false,
                Document: doc
            });
            this.GetCitedDocumentFromServer(doc.annulledDocInfo, 1);

        }
        if (this.state.AnnulleMode === 2) {
            var doc = this.state.Document;
            doc.paragraphs[this.state.SelectedNodeId].annulledDocInfo = {
                id: id,
                partid: partid
            };

            this.setState({
                SelectDocumentVisible: false,
                Document: doc
            });
            this.GetCitedDocumentFromServer(doc.annulledDocInfo, 2);

        }

    }



    GetCitedDocumentFromServer(citeInfo, mode/* 1 - whole document, 2 - part*/) {
        if (!citeInfo) {
            switch (mode) {
                case 1: this.setState({ WDAnnuledInfo: null }); break;
                case 2: this.setState({ CPAnnuledInfo: null }); break;
                default: break;
            }
            return;
        }

        Axios.get('https://www.dir.bg').then(
            result => {

                switch (mode) {
                    case 1: this.setState({ WDAnnuledInfo: docpartresponse }); break;
                    case 2: this.setState({ CPAnnuledInfo: docpartresponse }); break;
                    default: break;
                }

            }).catch(
                function (response) {
                    console.log(response);
                }
            );


    }



    AnnulleDocument(annulle) {
        var doc = this.state.Document;
        doc.annulled = annulle;

        if (annulle) {
            this.setState({
                Document: doc,
                AnnulleMode: 1,//1 за целия документ, 2 за параграфа
                SelectDocumentVisible: true
            });

        }
        else {
            doc.annulledDocInfo = null;
            this.setState({
                Document: doc
            });
            this.GetCitedDocumentFromServer(doc.annulledDocInfo, 1);
        }
    }


    AnnullePart(annulle) {
        var doc = this.state.Document;
        doc.paragraphs[this.state.SelectedNodeId].annulled = annulle;

        if (annulle) {
            this.setState({
                Document: doc,
                AnnulleMode: 2,//1 за целия документ, 2 за параграфа
                SelectDocumentVisible: true
            });

        }
        else {
            doc.paragraphs[this.state.SelectedNodeId].annulledDocInfo = null;
            this.setState({
                Document: doc
            });
            this.GetCitedDocumentFromServer(doc.paragraphs[this.state.SelectedNodeId].annulledDocInfo, 2);
        }
    }


    SetCategories(categoriesObj) {
        var doc = this.state.Document;
        console.log(categoriesObj);
        doc.categories = this.ConvertObjectToArray(categoriesObj);
        this.setState({ Document: doc, SelectCategoriesVisible: false });
    }

    Save() {
        var self = this;



        Axios.get('https://www.dir.bg').then(
            result => {

                //toast.error(self.T("mailused"));
                toast.info(self.T("savedok"));

            }).catch(
                function (response) {
                    console.log(response);
                    self.setState({
                        Searching: false
                    });
                }
            );
    }

    CreateNewVersion(old) {
        var document = JSON.parse(JSON.stringify(this.state.Document));
        if (old) {
            document.dateEnd = document.dateStart;
            document.dateStart = null;
        }
        else {
            document.dateStart = document.dateEnd;
            document.dateEnd = null;
        }
        var newId = uuidv4();
        document.id = newId;
        var self = this;
        Axios.get("https://www.dir.bg")
            .then(result => {
                self.setState({ ShowNewVer: newId })

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
                (this.state.Document && this.state.NomenclaturesLoaded ?

                    <div className="container-fluid mt-3">
                        <div className="row">
                            <div className="col-3">
                                <div className="row border">

                                    <div className="col-4">
                                        <button className="btn btn-primary" onClick={self.Save}>{self.T("save")}</button>
                                    </div>
                                    <div className="col-4">
                                        <button className="btn btn-success" onClick={()=>self.CreateNewVersion(false)}>{self.T("newer")}</button>
                                    </div>
                                    <div className="col-4">
                                        <button className="btn btn-danger" onClick={()=>self.CreateNewVersion(true)}>{self.T("older")}</button>
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
                                                        !self.Child2Parent[self.state.SelectedNodeId].isFirst ? <button className="btn btn-light" onClick={() => self.MovePart(true)}><i className="fas fa-sort-up fa-lg"></i></button> : null
                                                }


                                            </div>
                                            <div className="col-2 align-middle">
                                                {
                                                    self.Child2Parent[self.state.SelectedNodeId] &&
                                                        !self.Child2Parent[self.state.SelectedNodeId].isLast ? <button className="btn btn-light" onClick={() => self.MovePart(false)}><i className="fas fa-sort-down fa-lg"></i></button> : null
                                                }
                                            </div>
                                            <div className="col-2">
                                                {
                                                    self.state.Document.paragraphs[self.state.SelectedNodeId] &&
                                                        self.state.Document.paragraphs[self.state.SelectedNodeId].children.length === 0 ? <button className="btn btn-light" onClick={() => self.DeletePart()}><i className="fas fa-trash fa-lg"></i></button> : null}
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
                                            {<Calendar dateFormat="dd.mm.yy" value={moment(self.state.Document.dateStart).toDate()} onChange={(e) => {
                                                var doc = self.state.Document;
                                                doc.dateStart = moment(e.value).format('YYYYMMDD');
                                                self.setState({ Document: doc });
                                            }}
                                                readOnlyInput="true"></Calendar>}

                                        </div>
                                        <div className="col-2">
                                            <label className="control-label">{self.T("enddate")}</label>
                                        </div>
                                        <div className="col-4">
                                            {<Calendar dateFormat="dd.mm.yy" value={self.state.Document.dateEnd ? moment(self.state.Document.dateEnd).toDate() : null} onChange={(e) => {
                                                var doc = self.state.Document;
                                                doc.dateEnd = e.value ? moment(e.value).format('YYYYMMDD') : null;
                                                self.setState({ Document: doc });
                                            }}
                                                readOnlyInput="true" showButtonBar="true"></Calendar>}
                                        </div>
                                    </div>
                                    <div className="row border">
                                        <div className="col-2">
                                            <div class="checkbox">
                                                <label><input type="checkbox" checked={self.state.Document.annulled} onChange={(e) => self.AnnulleDocument(e.target.checked)} />{self.T("annulled")}</label>
                                            </div>
                                        </div>
                                        <div className="col-10">
                                            {
                                                self.state.WDAnnuledInfo ?
                                                    <label>{self.state.WDAnnuledInfo.title[self.SM.GetLanguage()]} {self.state.WDAnnuledInfo.part[self.SM.GetLanguage()]}</label>
                                                    : null
                                            }
                                        </div>
                                    </div>
                                    <div className="row border">
                                        <div className="col-12">
                                            <button className="btn btn-info" onClick={() => self.setState({ SelectCategoriesVisible: true })}>{self.T("categories")}</button>
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
                                    <div className="row border">
                                        <div className="col-3">
                                            <label className="control-label">
                                                {self.T("officialjournalnumber")}
                                            </label>
                                        </div>
                                        <div className="col-9">
                                            <input type="text" className="form-control" onChange={(e) => self.SetValueCommon("officialjournalnumber", e.target.value)} value={self.state.Document.officialjournalnumber}></input>
                                        </div>
                                    </div>
                                    <div className="row border">
                                        <div className="col-3">
                                            <label className="control-label">
                                                {self.T("officialjournalyear")}
                                            </label>
                                        </div>
                                        <div className="col-9">
                                            <input type="text" className="form-control" onChange={(e) => self.SetValueCommon("officialjournalyear", e.target.value)} value={self.state.Document.officialjournalyear}></input>
                                        </div>
                                    </div>

                                </div>
                                :

                                <div className="col-9  border">
                                    <PartEdit getProperty={self.GetSelectedNodeProperty}
                                        setProperty={self.SetSelectedNodeProperty}
                                        selectedNodeId={self.state.SelectedNodeId}
                                        annullePart={self.AnnullePart}
                                        annuledInfo={self.state.CPAnnuledInfo}

                                    ></PartEdit>
                                </div>
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
                        <Dialog header={self.T("selectdocument")} visible={this.state.SelectDocumentVisible} style={{ width: '50vw' }}
                            modal={true} onHide={() => self.setState({ SelectDocumentVisible: false })} >
                            <DocSelect onlyDocument={false} selectSuccess={self.SelectDocumentPart} ref={this.dsDoc}></DocSelect>
                        </Dialog>
                        <Dialog header={self.T("categories")} visible={this.state.SelectCategoriesVisible} style={{ width: '50vw' }}
                            modal={true} onHide={() => { this.csCategories.current.Reload(); self.setState({ SelectCategoriesVisible: false }); }} >
                            <CategoriesSelect selectSuccess={self.SelectCategories} ref="catSelect" categories={self.state.Document.categories} setcategories={self.SetCategories} ref={this.csCategories}></CategoriesSelect>
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

        )
    }
}

export default Document;
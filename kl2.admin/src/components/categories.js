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



export default class Categories extends BaseComponent {

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
                title: this.T("categories")
            }]
        )

        this.CreateExpandedNodes = this.CreateExpandedNodes.bind(this);
        this.DocumentElementTemplate = this.DocumentElementTemplate.bind(this);
        this.ChangeSelectedNode = this.ChangeSelectedNode.bind(this);
        this.FindById = this.FindById.bind(this);
        this.DeleteCategory = this.DeleteCategory.bind(this);
        this.DisplayTree = this.DisplayTree.bind(this);
        this.MovePart = this.MovePart.bind(this);
        this.NewCategory = this.NewCategory.bind(this);
        this.ChangeTitle = this.ChangeTitle.bind(this);
        this.SaveToDB = this.SaveToDB.bind(this)


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

                this.DisplayTree("-1", treeJSON);


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
        this.setState({
            SelectionInfo: this.FindById(nodeId, this.state.TreeJSON),
            SelectedNodeId: nodeId
        });
    }

    FindById(id, jsonArray) {
        for (var i = 0; i < jsonArray.length; i++) {
            if (jsonArray[i].key === id) {
                return {
                    array: jsonArray,
                    index: i,
                    element: jsonArray[i]

                };
            }
            var result = this.FindById(id, jsonArray[i].children);
            if (result)
                return result;
        }
        return null;
    }

    DeleteCategory() {
        if (this.state.SelectionInfo)
            this.state.SelectionInfo.array.splice(this.state.SelectionInfo.index, 1);
        this.DisplayTree("-1", this.state.TreeJSON);

    }

    DisplayTree(selectedId, json) {

        this.setState({
            TreeJSON: json,
            SelectedNodeId: selectedId,
            SelectionInfo: this.FindById(selectedId, json),
            ExpandedNodes: this.expandedNodes
        });

    }

    MovePart(up) {
        var myPos = this.state.SelectionInfo.index;
        var otherPos = (up ? myPos - 1 : myPos + 1);
        var children = this.state.SelectionInfo.array;
        var pom = children[myPos];
        children[myPos] = children[otherPos];
        children[otherPos] = pom;
        this.DisplayTree(this.state.SelectedNodeId, this.state.TreeJSON);
    }

    NewCategory() {
        var json = this.state.TreeJSON;
        var id = uuidv4();

        var nc = {
            key: id,
            title: {},
            data: {},
            children: []
        };
        var self = this;
        Languages.forEach(item => nc.data[item.key] = self.TranslateIntoLanguage("newcategory", item.key));

        if (this.state.SelectedNodeId == "-1")
            json[0].children.push(nc);
        else
            this.state.SelectionInfo.element.children.push(nc);

        this.expandedNodes[id] = true;

        this.DisplayTree(id, json);

    }

    ChangeTitle(language, value) {
        this.state.SelectionInfo.element.data[language] = value;
        this.setState({ SelectionInfo: this.state.SelectionInfo, TreeJSON: this.state.TreeJSON });
    }

    SaveToDB() {
        var self = this;

        Axios.get('https://www.dir.bg').then(
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
            this.state.TreeJSON ?
                <div className="container-fluid mt-3">
                    <div className="row">
                        <div className="col-9">
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
                        </div>
                        <div className="col-3">
                            <div className="row">
                                <div className="col-4">
                                    <button className="btn btn-primary" onClick={self.NewCategory}>{self.T("new")}</button>
                                </div>
                                <div className="col-4">
                                    {
                                        self.state.SelectedNodeId != "-1" ?
                                            <button className="btn btn-secondary">{self.T("edit")}</button>
                                            : null
                                    }
                                </div>
                                <div className="col-4">
                                    {
                                        self.state.SelectedNodeId != "-1" ?
                                            <button className="btn btn-danger" onClick={self.DeleteCategory}>{self.T("delete")}</button>
                                            : null
                                    }

                                </div>
                            </div>
                            <div className="row">
                                <div className="col-1">
                                    {
                                        self.state.SelectionInfo && self.state.SelectionInfo.index > 0 ?
                                            <button className="btn btn-light" onClick={() => self.MovePart(true)}><i className="fas fa-sort-up fa-lg"></i></button>
                                            : null
                                    }
                                </div>
                                <div className="col-1">
                                    {
                                        self.state.SelectionInfo && self.state.SelectionInfo.index < self.state.SelectionInfo.array.length - 1 ?
                                            <button className="btn btn-light" onClick={() => self.MovePart(false)}><i className="fas fa-sort-down fa-lg"></i></button>
                                            : null
                                    }

                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    {
                                        self.state.SelectedNodeId != "-1" ?
                                            <MLEdit prefix="title" parent={self.state.SelectionInfo.element.data} change={self.ChangeTitle}></MLEdit>
                                            : null
                                    }
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <button className="btn btn-primary" onClick={self.SaveToDB}>{self.T("savetodb")}</button>
                                </div>
                            </div>


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


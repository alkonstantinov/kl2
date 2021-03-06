import React, { Component } from 'react';

import searchresult from '../data/searchresult';
import BaseComponent from '../components/basecomponent';
import Axios from 'axios';
import { Tree } from 'primereact/tree';
import Comm from '../modules/comm';


class DocSelect extends BaseComponent {
    constructor(props) {
        super(props);
        this.Search = this.Search.bind(this);
        this.SelectDocument = this.SelectDocument.bind(this);

        this.CreateTree = this.CreateTree.bind(this);
        this.DocumentElementTemplate = this.DocumentElementTemplate.bind(this);
        this.SelectPart = this.SelectPart.bind(this);
        this.GoToStart = this.GoToStart.bind(this);
        this.state.SearchResult = null;
        this.state.DisplayMode = "documents";
    }



    Search() {
        var self = this;
        var postData = { SS: self.state.Rec.SS, LimitResult: 100 };

        Comm.Instance().post('admin/SearchDocument', postData).then(
        
            result => {
                var resultList = result.data;
                resultList.forEach(x => x.documentData = JSON.parse(x.documentData));
                self.setState({ SearchResult: resultList });

            }).catch(
                function (response) {
                    console.log(response);
                }
            );

    }

    CreateTree(document, id, parent) {

        var children = (parent === null ? document.rootParagraphs : document.paragraphs[parent].children);
        let element = Object.create(null);
        element.key = id;
        element.label = document.paragraphs[id].title[this.SM.GetLanguage()];
        element.children = [];
        document.paragraphs[id].children.forEach(x =>
            element.children.push(this.CreateTree(document, x, id))
        );
        return element;
    }

    SelectDocument(doc) {
        var self = this;
        this.setState({ SelectedDocumentId: doc.id });
        if (this.props.onlyDocument)
            this.props.selectSuccess(doc.id, null);
        else {

            
                    var expandedNodes = { "-1": true };

                    Object.keys(doc.paragraphs).forEach(item => expandedNodes[item] = true);
                    self.setState({
                        DisplayMode: "parts",
                        Document: doc,
                        TreeData: [{
                            key: "-1",
                            label: self.T("document"),
                            data: {},
                            children: doc.rootParagraphs.map(item => self.CreateTree(doc, item, null))
                        }],
                        ExpandedNodes: expandedNodes
                    });

            


        }
    }

    SelectPart(id) {
        this.setState({ DisplayMode: "documents" });
        this.props.selectSuccess(this.state.SelectedDocumentId, id);
    }

    GoToStart() {
        this.setState({ DisplayMode: "documents" });

    }

    DocumentElementTemplate(node) {
        return (
            node.key != "-1" ?
                <a href="#" onClick={() => this.SelectPart(node.key)}>{node.label}</a>
                :
                <span>{node.label}</span>

        );
    }


    render() {
        var self = this;

        return (
            self.state.DisplayMode === "documents" ?
                [
                    <div className="row">
                        <div className="col-10">
                            <input type="text" className="form-control" value={self.state.Rec.SS} onChange={self.HandleChange}></input>
                        </div>
                        <div className="col-2">
                            <button className="btn btn-primary" onClick={self.Search}>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                    </div>,
                    <div className="row">
                        <div className="col-11">
                            {
                                self.state.SearchResult !== null ?
                                    self.state.SearchResult.length > 0 ?
                                        <table className="tbl tbl-stripped">
                                            <tbody>
                                                {
                                                    self.state.SearchResult.map(obj =>
                                                        <tr>
                                                            <td>
                                                                <a onClick={() => self.SelectDocument(obj.documentData)} href="#">{obj.documentData.title[self.SM.GetLanguage()]}</a>
                                                            </td>
                                                        </tr>
                                                    )
                                                }

                                            </tbody>
                                        </table>
                                        : <label className="alert alert-danger">{self.T("searchstringnotfound")}</label>
                                    :
                                    null

                            }
                        </div>
                    </div>
                ]
                :
                <Tree
                    selectionMode="single"
                    value={self.state.TreeData}
                    style={{ marginTop: '.5em', width: '100%' }}
                    nodeTemplate={self.DocumentElementTemplate}
                    expandedKeys={self.state.ExpandedNodes}

                />
        )
    }
}

export default DocSelect;
import React from 'react';
import BaseComponent from '../components/basecomponent';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import { Tree } from 'primereact/tree';
import Loader from 'react-loader-spinner';
import Comm from '../modules/comm';



export default class CategoriesSelect extends BaseComponent {

    expandedNodes;

    constructor(props) {
        super(props);
        this.CreateExpandedNodes = this.CreateExpandedNodes.bind(this);
        this.DocumentElementTemplate = this.DocumentElementTemplate.bind(this);
        this.DisplayTree = this.DisplayTree.bind(this);
        this.CheckCategory = this.CheckCategory.bind(this);
        this.SetCategories = this.SetCategories.bind(this);
        this.Reload = this.Reload.bind(this);

        this.state.Checks = {};

    }

    CreateExpandedNodes(elementFromJSON, ExpandedNodes) {

        ExpandedNodes[elementFromJSON.key] = true;
        var self = this;
        elementFromJSON.children.forEach(x =>
            self.CreateExpandedNodes(x, ExpandedNodes)
        );
    }

    Reload() {
        var checks = this.ConvertArrayToObject(this.props.categories);
        this.setState({ Checks: checks, TreeJSON: this.state.TreeJSON });

    }





    componentDidUpdate(prevProps, prevState) {
        if (prevProps.categories !== this.props.categories) {
            var checks = this.ConvertArrayToObject(this.props.categories);
            this.setState({ Checks: checks, TreeJSON: this.state.TreeJSON });

        }
    }

    componentDidMount() {
        var self = this;

        var checks = this.ConvertArrayToObject(this.props.categories);



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
                this.setState({ Checks: checks });
                this.DisplayTree("-1", treeJSON);


            })
            .catch(
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
            return (
                <div class="checkbox">
                    <label><input type="checkbox" checked={this.state.Checks[node.key] === true} onChange={(e) => this.CheckCategory(e.target.checked, node.key)} />{node.data[this.SM.GetLanguage()]}</label>
                </div>
            )



    }

    CheckCategory(check, id) {
        var checks = this.state.Checks;
        checks[id] = check;
        this.setState({ Checks: checks });
    }




    DisplayTree(selectedId, json) {

        this.setState({
            TreeJSON: json,
            SelectedNodeId: selectedId,
            ExpandedNodes: this.expandedNodes
        });

    }

    SetCategories() {
        this.props.setcategories(this.state.Checks);
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

                            />
                        </div>
                        <div className="col-3">
                            <div className="row">
                                <div className="col-4">
                                    <button className="btn btn-primary" onClick={self.SetCategories}>{self.T("ok")}</button>
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


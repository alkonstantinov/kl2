import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import BaseComponent from './basecomponent';
import eventClient from '../modules/eventclient';
import { Link } from 'react-router-dom';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Axios from 'axios';


class MainMenu extends BaseComponent {
    constructor(props) {
        super(props);
        eventClient.emit(
            "breadcrump",
            [{
                title: this.T("mainmenu")
            }]
        )
        this.state = {

        };

        this.uploadCallback = this.uploadCallback.bind(this);


    }


    uploadCallback(file) {
        return new Promise(
            (resolve, reject) => {
                var formData = new FormData();
                formData.append("image", file);
                //Axios.defaults.baseURL = 'http://myurl';
                //Axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
                Axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
                Axios.post('http://localhost:57274/api/values/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(
                    function (response) {
                        window.alert(response);
                        console.log(response);
                        resolve({ data: { link: response.data } })
                      });


            }
        );
    }




    render() {
        var self = this;
        return (

            <div className="container mt-3">
                <Link className="btn btn-default" to='/doc/123'>
                    <i className="fas fa-list"></i>
                    <p>ьььььььь</p>
                </Link>
                <br />
                <Editor
                    wrapperClassName="wrapper-class"
                    editorClassName="editor-class"
                    toolbarClassName="toolbar-class"

                    toolbar={{
                        options: ['image'],

                        image: {
                            urlEnabled: false,
                            uploadEnabled: true,
                            uploadCallback: self.uploadCallback

                        }
                    }}
                />
            </div>

        )
    }
}

export default MainMenu;
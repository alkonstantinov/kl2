import React from 'react';
import BaseComponent from './basecomponent';
import eventClient from '../modules/eventclient';
import { Link } from 'react-router-dom';
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
                <div className="row">
                    <div className="col-3">
                        <Link className="btn btn-default fillSpace" to='/documentsearch'>
                            <i class="fas fa-search"></i>
                            <p>{self.T("documents")}</p>
                        </Link>

                    </div>
                    <div className="col-3">
                        <Link className="btn btn-default fillSpace" to='/categories'>
                            <i class="fas fa-sitemap"></i>
                            <p>{self.T("categories")}</p>
                        </Link>

                    </div>
                    <div className="col-3">
                        <Link className="btn btn-default fillSpace" to='/users'>
                            <i class="fas fa-users"></i>
                            <p>{self.T("users")}</p>
                        </Link>

                    </div>
                </div>

            </div>

        )
    }
}

export default MainMenu;
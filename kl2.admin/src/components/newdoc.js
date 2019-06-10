import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

export default class NewDoc extends Component {


    render() {
        return (
            <Redirect to={"/doc/" + this.props.match.params.docId} push />
        )
    }
}
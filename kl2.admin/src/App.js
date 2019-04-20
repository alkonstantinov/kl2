import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import BaseComponent from './components/basecomponent';

class App extends Component {
  render() {
    return (

      <div class="container">
        <Switch>

          <Route exact path='/' component={BaseComponent} />


        </Switch>
      </div>


    );
  }
}

export default App;

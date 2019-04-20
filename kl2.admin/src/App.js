import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import BaseComponent from './components/basecomponent';

class App extends Component {
  render() {
    return (
      <Switch>

        <Route exact path='/' component={BaseComponent} />
                        
         <Route path="*" component={BaseComponent} /> 

      </Switch> 
    );
  }
}

export default App;

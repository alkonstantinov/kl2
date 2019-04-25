import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import Login from './components/login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class App extends Component {
  render() {
    return (

      <div className="container">
        <header className="navbar fixed-top">header</header>
        <ToastContainer position={toast.POSITION.TOP_LEFT} autoClose={5000} />
        <Switch>

          <Route exact path='/' component={Login} />


        </Switch>


        <footer className="navbar fixed-bottom">
          footer
        </footer>
      </div>


    );
  }
}

export default App;

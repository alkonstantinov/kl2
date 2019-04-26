import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import Login from './components/login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BaseComponent from './components/basecomponent';
import Header from './components/header';
import eventClient from './modules/eventclient';
import MainMenu from './components/mainmenu';

class App extends BaseComponent {

  constructor(props) {
    super(props);
    this.LoginEvent = this.LoginEvent.bind(this);
    this.state = {
      dt: new Date().getMilliseconds()
    };
  }



  LoginEvent(data) {
    this.setState({ user: this.SM.GetSession() });
  }

  componentWillMount() {
    eventClient.on('loginchange', this.LoginEvent);
  }

  componentWillUnmount() {
    eventClient.removeEventListener('loginchange', this.LoginEvent);
  }
  render() {
    var self = this;

    return (

      <div className="container">
        {self.SM.GetSession() === null ? null : <Header></Header>}
        <ToastContainer position={toast.POSITION.TOP_LEFT} autoClose={5000} />
        
        <main>
          {
            self.SM.GetSession() === null ?
              <Login></Login>
              :
              <Switch>
                <Route exact path='/mainmenu' component={MainMenu} />
                <Route component={MainMenu} />


              </Switch>
          }
        </main>





        <footer className="navbar fixed-bottom">
          footer
        </footer>
      </div>


    );
  }
}

export default App;

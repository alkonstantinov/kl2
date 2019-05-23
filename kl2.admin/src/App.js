import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import Login from './components/login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BaseComponent from './components/basecomponent';
import Header from './components/header';
import eventClient from './modules/eventclient';
import MainMenu from './components/mainmenu';
import Document from './components/document';


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
    eventClient.on('language', this.Refresh);
  }

  componentWillUnmount() {
    eventClient.removeEventListener('loginchange', this.LoginEvent);
    eventClient.removeEventListener('language', this.Refresh);
  }
  render() {
    var self = this;

    return (

      <div className="container-fluid">
        <Header></Header>
        <ToastContainer position={toast.POSITION.TOP_LEFT} autoClose={5000} />

        <main>
          {
            self.SM.GetSession() === null ?
              <Login></Login>
              :
              <Switch>
                <Route exact path='/mainmenu' component={MainMenu} />
                <Route exact path='/doc' component={Document} />
                <Route exact path='/doc/:docId' component={Document} />

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

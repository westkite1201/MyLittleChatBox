import React, { Component } from 'react';
import { Route } from 'react-router-dom';
//import Login from '../components/Login'
import Dashboard from "../layouts/DashBoard";
class App extends Component {
    render() {
        return (
            <div>
                {/*<div id ='background'>dsdsad</div>*/}
                {/*<Route exact path="/login" component={Login}/>*/}
                {/*<Route path="/board" component={SideNav}/>*/}
                <Route path="/" component ={Dashboard}/>
            </div>
        );  
    }
}

export default App;
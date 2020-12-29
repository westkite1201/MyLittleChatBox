import React, { Component } from 'react';
import style from './DashBoard.module.css';
import { Switch, Route, Redirect } from 'react-router-dom';
import dashboardRoutes from '../../routes/dashboard.js';
import SideBar from '../../components/SideBar';
//import SideNav from '../../components/SideNav';

const switchRoutes = (
  <Switch>
    {dashboardRoutes.map((prop, key) => {
      if (prop.redirect) {
        return <Redirect from={prop.path} to={prop.to} key={key} />;
      }
      if (prop.exact) {
        return (
          <Route exact path={prop.path} component={prop.component} key={key} />
        );
      }
      return <Route path={prop.path} component={prop.component} key={key} />;
    })}
  </Switch>
);

export default class DashBoard extends Component {
  state = {
    open: true,
    marginLeft: 0
  };
  openSideBar = () => {
    console.log('hi');
    this.setState({
      open: !this.state.open
    });
  };
  handleClick = (e) => {
    console.log(e.target);
  };

  render() {
    const openStyle = {
      //fontSize: '2rem',
      marginLeft: '200px'
    };
    const closeStyle = {
      marginLeft: '0px'
      //fontSize: '2rem'
    };

    const { open } = this.state;

    return (
      <div className={style.wrapper}>
        <SideBar
          routes={dashboardRoutes}
          openSideBar={this.openSideBar}
          open={open}
        />
        <div className={style.mainPanel}>
          <div className={style.content}>
            <div
              className={style.container}
              style={open ? openStyle : closeStyle}
            >
              {switchRoutes}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

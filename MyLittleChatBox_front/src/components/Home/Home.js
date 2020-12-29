import React, { Component } from 'react';
import _ from 'lodash';
import ChatView from '../ChatView';
import ChatViewNew from '../ChatView/ChatViewNew';
import './Home.scss';
/* Client Chat View  */
class Home extends Component {
  render() {
    return (
      <div className="home-wrapper">
        <div className="chat-view-container">
          <ChatView />
          <ChatViewNew />
        </div>
      </div>
    );
  }
}

export default Home;

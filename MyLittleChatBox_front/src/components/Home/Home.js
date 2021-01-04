import React, { Component } from 'react';
import ChatView from '../ChatView';
import './Home.scss';
/* Client Chat View  */
class Home extends Component {
  render() {
    return (
      <div className="home-wrapper">
        <div className="chat-view-container">
          {/*<ChatView />*/}
          <ChatView />
        </div>
      </div>
    );
  }
}

export default Home;

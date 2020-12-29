import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import ChatItem from './ChatItem';
import _ from 'lodash';
import './ChatView.scss';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

/* Client Chat View  */
class ChatView extends Component {
  state = {
    chatMsg: ''
    //chatSocket : io('http://localhost:3031/chat')
  };
  componentDidMount() {
    const { setSocketConnection } = this.props;

    setSocketConnection();
    console.log('[SEO][ChatView] componentDidMount');
    // getRoomList();
  }
  /* 나가기  */
  componentWillUnmount() {
    // const { leaveChatRoom, selectRoomId } = this.props;
    // leaveChatRoom(selectRoomId);
  }

  //서버로 전송
  chatMessageSendServer = (e) => {
    const { chatMsg, nickName } = this.state;
    e.preventDefault();
    console.log('chatMessageSendServer!!');
    const { sendChatMessage } = this.props;
    sendChatMessage(chatMsg, nickName);
    document.getElementById('inputMessage').value = '';
    this.setState({
      chatMsg: ''
    });
    //this.sendChatMessage(this.state.chatMsg)
  };
  //인풋 박스 핸들링
  handleChatMessage = (e) => {
    console.log(this.state.chatMsg);
    console.log(e.target);
    this.setState({
      chatMsg: e.target.value
    });
  };

  getRoomList = () => {
    const { getRoomList } = this.props;
    getRoomList();
  };
  render() {
    const { chatMessageMap, selectRoomId, getChatMessage } = this.props;

    console.log(
      '[SEO] selectRoomId',
      selectRoomId,
      chatMessageMap.get(selectRoomId)
    );
    let chatMessageList = [];
    if (!_.isNil(chatMessageMap.get(selectRoomId))) {
      chatMessageList = chatMessageMap.get(selectRoomId);
    }
    let chatMessage = chatMessageList.map((item, i) => {
      let messageClassName;
      if (item.system) {
        messageClassName = 'system-message';
      } else {
        if (item.isMe) {
          messageClassName = 'myMessage';
        } else if (!item.isMe) {
          messageClassName = 'anotherUserMessage';
        }
      }
      return !item.isMe ? (
        <ChatItem userName={item.userName} message={item.message} key={i} />
      ) : (
        <div className={messageClassName}>
          {item.userName + ': ' + item.message}
        </div>
      );
    });

    return (
      <div className="chat-view-wrapper">
        <div className="header">
          <span>대화를 시작합시다!</span>
        </div>
        <div className="message-wrapper">
          <div className="message-container">{chatMessage}</div>
        </div>
        <div className="chat-send-wrapper">
          <form onSubmit={this.chatMessageSendServer}>
            <TextField
              id="inputMessage"
              //label="메세지를 입력해주세요"
              //className={classes.textField}
              type="text"
              name="inputMessage"
              onChange={this.handleChatMessage}
              placeholder="메세지를 입력하세요!"
            />
            <input
              id="send-message"
              type="submit"
              style={{ display: 'none' }}
            />
            <label
              htmlFor="send-message"
              type="submit"
              style={{ margin: '0px' }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={this.chatMessageSendServer}
                size={'small'}
              >
                Send
                <Icon>send</Icon>
              </Button>
            </label>
          </form>
        </div>
      </div>
    );
  }
}
export default inject(({ chat }) => ({
  getChatMessage: chat.getChatMessage,
  createChatRoom: chat.createChatRoom,
  initUserInfo: chat.initUserInfo,
  getRoomList: chat.getRoomList,
  joinRoom: chat.joinRoom,
  setSocketConnection: chat.setSocketConnection,
  sendChatMessage: chat.sendChatMessage,
  chatMessageMap: chat.chatMessageMap,
  chatMessage: chat.chatMessage,
  selectRoomId: chat.selectRoomId,
  leaveChatRoom: chat.leaveChatRoom
}))(observer(ChatView));

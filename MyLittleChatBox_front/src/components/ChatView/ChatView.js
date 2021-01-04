import React, { useEffect } from 'react';
//import UseStores from "../../lib/UseStores";
import { observer, useLocalObservable } from 'mobx-react';
import useStore from '../../stores/useStore';
import { TextField, Button } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import ChatItem from './ChatItem';
import './ChatView.scss';
import _ from 'lodash';
//커스텀 훅

const ChatView = observer(() => {
  const { chatStore } = useStore();

  useEffect(() => {
    chatStore.setSocketConnection();
    //chatStore.initUserInfo();
  }, []);

  const state = useLocalObservable(() => ({
    name: '',
    password: '',
    chatMsg: '',
    onChangeName(e) {
      this.chatMsg = e.target.value;
    },
    chatMessageSendServer(e) {
      e.preventDefault();
      console.log('chatMessageSendServer!!');
      chatStore.sendChatMessage(this.chatMsg, 'test');
      document.getElementById('inputMessage').value = '';
      this.name = '';
    },
  }));

  function RenderChatMessage() {
    const { chatMessageMap, selectRoomId } = chatStore;
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
        <ChatItem
          userName={item.userName}
          message={item.message}
          key={i + '_' + item.message}
        />
      ) : (
        <div className={messageClassName} key={i + '_' + item.message}>
          {item.userName + ': ' + item.message}
        </div>
      );
    });
    return chatMessage;
  }

  return (
    <div className="chat-view-wrapper">
      <div className="header">
        <span>대화를 시작합시다!</span>
      </div>
      <div className="message-wrapper">
        <div className="message-container">{RenderChatMessage()}</div>
      </div>
      <div className="chat-send-wrapper">
        <form onSubmit={state.chatMessageSendServer}>
          <TextField
            id="inputMessage"
            value={state.chatMsg}
            //label="메세지를 입력해주세요"
            //className={classes.textField}
            type="text"
            name="inputMessage"
            onChange={state.onChangeName}
            placeholder="메세지를 입력하세요!"
          />
          <input id="send-message" type="submit" style={{ display: 'none' }} />
          <label htmlFor="send-message" type="submit" style={{ margin: '0px' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={state.chatMessageSendServer}
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
});

export default ChatView;

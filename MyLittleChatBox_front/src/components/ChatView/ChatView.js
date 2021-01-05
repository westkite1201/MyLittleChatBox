import React, {
  useEffect,
  useState,
  Fragment,
  useRef,
  useCallback,
} from 'react';
//import UseStores from "../../lib/UseStores";
import { observer, useLocalObservable } from 'mobx-react';
import { autorun } from 'mobx';
import useStore from '../../stores/useStore';
import { TextField, Button } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import ChatItem from './ChatItem';
import './ChatView.scss';
import _ from 'lodash';
//커스텀 훅

const ChatView = observer(() => {
  const { chatStore } = useStore();
  //const [chatList, setChatList ]
  const [makeRoom, setMakeRoom] = useState(false);
  const [clientId, setClientId] = useState('');
  const messagesRef = useRef(null); // 메시지 엘리먼트를 저장
  useEffect(() => {
    if (makeRoom) {
      chatStore.setSocketConnection(clientId);
    }
    //chatStore.initUserInfo();
  }, [makeRoom]);

  const state = useLocalObservable(() => ({
    name: '',
    password: '',
    chatMsg: '',
    messageList: '',
    onChangeName(e) {
      this.chatMsg = e.target.value;
    },
    chatMessageSendServer(e) {
      e.preventDefault();
      console.log('chatMessageSendServer!!');
      chatStore.sendChatMessage(this.chatMsg, 'test');
      document.getElementById('inputMessage').value = '';
      this.name = '';
      this.chatMsg = '';
    },
    renderChatMessage() {
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
      this.messageList = chatMessage;
    },
  }));

  /*
      useEffect can be used to set up side effects that need to happen, 
      and which are bound to the life-cycle of the React component. 
      Using useEffect requires specifying dependencies. 
      With MobX that isn't really needed, 
      since MobX has already a way to automatically determine the dependencies of an effect, autorun. 
      Combining autorun and coupling it to the life-cycle of the component 
      using useEffect is luckily straightforward:

  */
  useEffect(
    () =>
      autorun(() => {
        state.renderChatMessage();
      }),
    [],
  );
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [state.messageList]);

  function makeRoomButton() {
    return (
      <div>
        <button onClick={() => setMakeRoom(true)}>채팅방 만들기</button>
        <input
          type="text"
          placeholder="client id"
          onChange={(e) => {
            setClientId(e.target.value);
          }}
        ></input>
      </div>
    );
  }

  function makeChatView() {
    return (
      <Fragment>
        <div className="header">
          <span>대화를 시작합시다!</span>
        </div>
        <div className="message-wrapper">
          <div className="message-container" ref={messagesRef}>
            {state.messageList}
          </div>
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
                onClick={state.chatMessageSendServer}
                size={'small'}
              >
                Send
                <Icon>send</Icon>
              </Button>
            </label>
          </form>
        </div>
      </Fragment>
    );
  }
  return (
    <div className="chat-view-wrapper">
      {makeRoom ? makeChatView() : makeRoomButton()}
    </div>
  );
});

export default ChatView;

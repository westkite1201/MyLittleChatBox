import React, { useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { observer, useLocalObservable } from 'mobx-react';
import TextField from '@material-ui/core/TextField';
import ChatItem from '../../ChatView/ChatItem';

import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { isEmpty } from 'lodash';
import ClearSharpIcon from '@material-ui/icons/ClearSharp';
import './AdminChat.scss';
import useStore from '../../../stores/useStore';

const AdminChat = observer(() => {
  const { chatStore } = useStore();
  let searchResult = [];
  const state = useLocalObservable(() => ({
    name: '',
    password: '',
    chatMsg: '',
    temp: [],
    //인풋 박스 핸들링
    handleChatMessage(e) {
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

  useEffect(() => {
    chatStore.setSocketConnection('admin');
    chatStore.getChatRoomList();
  }, []);

  const handleSearch = () => {};
  //   handleSearch = (e) => {
  //     console.log('handleSearch##');
  //     e.preventDefault();
  //     const { roomNameList } = this.props;
  //     document.getElementById('input-with-icon-textfield').value = '';
  //   };

  //   handleSearchKeyword = (e) => {
  //     const { roomNameList } = this.props;
  //     if (isEmpty(e.target.value)) {
  //       console.log('none');
  //       this.searchResult = [];
  //       console.log(this.searchResult);
  //     } else {
  //       this.searchResult = this.createListItem(
  //         roomNameList.filter((item) => {
  //           console.log(item.includes(e.target.value));
  //           return item.includes(e.target.value);
  //         }),
  //       );
  //     }
  //     console.log(roomNameList);
  //   };

  const removeSearchResult = () => {};
  //   removeSearchResult = (e) => {
  //     this.setState({
  //       searchResult: [],
  //     });
  //   };

  //   handleSearchCancel = (e) => {
  //     console.log(e.key);
  //     if (e.key === 'Escape') {
  //       console.log(e.target.key);
  //       this.searchResult = [];
  //     }
  //   };

  function hanldeJoinChatRoom(e) {
    chatStore.joinChatRoom(e);
  }
  function createListItem() {
    const { selectRoomId } = chatStore;
    const list = chatStore.getRoomNameList;
    console.log('[SEOYEON] list ', list, selectRoomId);
    return list.map((item, i) => {
      return (
        <ListGroupItem
          className={selectRoomId === item ? 'active' : 'unactive'}
          tag="button"
          onClick={(e) => hanldeJoinChatRoom(e)}
          key={i}
          name={item}
        >
          {item}
        </ListGroupItem>
      );
    });
  }

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
  function handleGetChatRoomList() {
    chatStore.getChatRoomList();
  }
  function handleDeleteRedisKey() {
    chatStore.deleteRedisKey();
  }

  return (
    <div className="chatRooWrapper" height="100%">
      <button onClick={handleGetChatRoomList}>getChatRoomList</button>
      <button onClick={handleDeleteRedisKey}>deleteRedisKey</button>
      <div className={'roomList'}>
        <form className={'searchBox'} onSubmit={handleSearch}>
          <SearchOutlinedIcon />
          <TextField
            id="input-with-icon-textfield"
            placeholder="Search Contacts"
            // onChange={this.handleSearchKeyword}
            // onKeyDown={this.handleSearchCancel}
            fullWidth={true}
          />
          <ClearSharpIcon onClick={removeSearchResult} />
        </form>
        <ListGroup>{searchResult}</ListGroup>
        <ListGroup>{createListItem()}</ListGroup>
      </div>
      <div className="chatRoom">
        <div className="message">{RenderChatMessage()}</div>
        <div className="inputBox">
          <form
            onSubmit={state.chatMessageSendServer}
            style={{ width: '100%' }}
          >
            <TextField
              id="inputMessage"
              //label="메세지를 입력해주세요"
              //className={classes.textField}
              type="text"
              name="inputMessage"
              onChange={state.handleChatMessage}
              placeholder="message"
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
      </div>
    </div>
  );
});

export default AdminChat;

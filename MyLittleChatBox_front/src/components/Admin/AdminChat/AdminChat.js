import React, { useEffect, useState, useRef, Fragment } from 'react';
import { observer, useLocalObservable } from 'mobx-react';
import { autorun } from 'mobx';
import TextField from '@material-ui/core/TextField';
import ChatItem from '../../ChatView/ChatItem';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import ClearSharpIcon from '@material-ui/icons/ClearSharp';
import './AdminChat.scss';
import styled from 'styled-components';
import useStore from '../../../stores/useStore';

const St = {
  RoomListWrpper: styled.div`
    display: flex;
    flex-direction: column;
  `,
  RoomItem: styled.div`
    padding: 0.75rem 1.25rem;

    width: 100%;
    height: 3rem;
    display: flex;
    justify-content: space-between;
    background-color: ${(props) => (props.isActive ? '#ff8787' : '#fff')};
    color: ${(props) => (props.isActive ? '#fff' : 'black')};
    &:hover {
      background-color: #ffec99;
      color: black;
    }
  `,
  Badge: styled.div`
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
    background: red;
  `,
};
const AdminChat = observer(() => {
  console.log('adminChat');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState('admin');

  const { chatStore } = useStore();
  const messagesRef = useRef(null); // 메시지 엘리먼트를 저장
  let searchResult = [];
  const state = useLocalObservable(() => ({
    name: '',
    password: '',
    chatMsg: '',
    temp: [],
    messageList: '',
    //인풋 박스 핸들링
    handleChatMessage(e) {
      this.chatMsg = e.target.value;
    },
    chatMessageSendServer(e) {
      e.preventDefault();
      if (this.chatMsg !== '') {
        console.log('chatMessageSendServer!!');
        chatStore.sendChatMessage(this.chatMsg, 'test');
        document.getElementById('inputMessage').value = '';
        this.chatMsg = '';
      }
    },
    renderChatMessage() {
      const { chatMessageMap, selectRoomId } = chatStore;
      let chatMessageList = [];
      if (!_.isNil(chatMessageMap.get(selectRoomId))) {
        chatMessageList = chatMessageMap.get(selectRoomId);
        let chatMessage = chatMessageList.map((item, i) => {
          return <ChatItem item={item} key={i + '_' + item.message} />;
        });
        console.log('chatMessage', chatMessage);

        this.messageList = chatMessage;
      }
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

  useEffect(() => {
    if (isAdmin) {
      chatStore.setSocketConnection(adminId, true);
      chatStore.getChatRoomList(adminId);
    }
  }, [isAdmin]);
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

  function handleJoinChatRoom(roomid) {
    chatStore.joinChatRoom(roomid);
  }
  function createListItem() {
    const { selectRoomId, getRoomNameList } = chatStore;
    const list = getRoomNameList;
    return list.map((item, i) => {
      return (
        <St.RoomItem
          isActive={selectRoomId === item.roomId ? true : false}
          tag="button"
          onClick={() => handleJoinChatRoom(item.roomId)}
          key={i}
          name={item.roomId}
        >
          <span>{item.userId}</span>
          {item.allMessageCount - item.readCount !== 0 && (
            <St.Badge style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontStyle: 'bold' }}>
                {item.allMessageCount - item.readCount}
              </span>
            </St.Badge>
          )}
        </St.RoomItem>
      );
    });
  }

  function handleGetChatRoomList() {
    chatStore.getChatRoomList(adminId);
  }
  function handleDeleteRedisKey() {
    chatStore.deleteRedisKey();
  }

  function makeAdminPageButton() {
    return (
      <div>
        <button onClick={() => setIsAdmin(true)}>이건 admin만들기 버튼</button>
        <input
          type="text"
          placeholder="admin id"
          onChange={(e) => {
            setAdminId(e.target.value);
          }}
        ></input>
      </div>
    );
  }
  function makeAdminPage() {
    return (
      <Fragment>
        <div className="roomList">
          {/*}
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
    */}
          <div className="searchBox">
            <button onClick={handleGetChatRoomList}>getChatRoomList</button>
            <button onClick={handleDeleteRedisKey}>deleteRedisKey</button>
          </div>

          <div>{searchResult}</div>
          <St.RoomListWrpper>{createListItem()}</St.RoomListWrpper>
        </div>
        <div className="chatRoom">
          <div className="message" ref={messagesRef}>
            {state.messageList}
          </div>
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
                placeholder="하시고 싶은말을 입력하세요!"
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
      </Fragment>
    );
  }

  return (
    <div className="chatRooWrapper" height="100%">
      {isAdmin ? makeAdminPage() : makeAdminPageButton()}
    </div>
  );
});

export default React.memo(AdminChat);

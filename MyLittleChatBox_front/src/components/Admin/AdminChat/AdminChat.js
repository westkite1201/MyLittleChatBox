import React, { Component } from 'react'
import { ListGroup, ListGroupItem } from 'reactstrap';
import { observer, inject, } from 'mobx-react'
import { observable, action } from 'mobx'
import TextField from '@material-ui/core/TextField';
import ChatItem from  '../../ChatView/ChatItem'

import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import _ from 'lodash'
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import {isEmpty} from 'lodash'
import ClearSharpIcon from '@material-ui/icons/ClearSharp';
import './AdminChat.scss';

class AdminChat extends Component{
    @observable searchResult = [];
    @observable roomList = [];
    @observable roomSelect = '';
    state = {
        nickName : 'SEOYEON',
        chatMsg : '',
        temp : [],
        //chatSocket : io('http://localhost:3031/chat')
    }
    componentDidMount(){
        const { getChatRoomList, setSocketConnection }  =this.props;
        setSocketConnection('admin')
        getChatRoomList();
        // setInterval(()=>{
        //     getChatRoomList();
        // },1000)
    }
       //인풋 박스 핸들링 
    handleChatMessage = (e) =>{
        console.log(this.state.chatMsg)
        this.setState({
            chatMsg : e.target.value
        })
    }
    //서버로 전송 
    chatMessageSendServer = (e) => {
        const {chatMsg , nickName} = this.state;
        e.preventDefault();
        console.log("chatMessageSendServer!!")
        const { sendChatMessage } = this.props;
        sendChatMessage(chatMsg, 'ADMIN')
        //this.sendChatMessage(this.state.chatMsg)
    }
    handleSearch = (e) =>{
        console.log("handleSearch##")
        e.preventDefault();
        const { roomNameList } = this.props
        document.getElementById('input-with-icon-textfield').value = ''

    }
    @action
    handleSearchKeyword = (e) =>{
        const { roomNameList } = this.props;
        if(isEmpty(e.target.value)){
            console.log('none')
            this.searchResult = [];
            console.log(this.searchResult)
        }else{
            this.searchResult = this.createListItem(roomNameList.filter(item=>{
                console.log(item.includes(e.target.value))
                return item.includes(e.target.value)
            }))
        }        
        console.log(roomNameList)
    }
    createListItem = list => {
        const { joinChatRoom,
                selectRoomId } = this.props;
        return list.map((item, i ) => {
            return(
                <ListGroupItem className = { selectRoomId === item ? 'active' : 'unactive' }
                               tag="button" 
                               onClick ={joinChatRoom}
                               key = {i}
                               name={item} >{item}
                </ListGroupItem>
            )
        })
    }
    removeSearchResult = (e) =>{
        this.setState({
            searchResult:[],
        })
    }
    @action
    handleSearchCancel = (e) =>{
        console.log(e.key)
        if(e.key === 'Escape'){
            console.log(e.target.key)
            this.searchResult = [];
        }
    }
    render() {
         const { chatMessageMap,
              selectRoomId,
              getChatRoomList,
              deleteRedisKey,
              roomNameList }  =this.props;
        
        console.log( "[SEO] selectRoomId" ,selectRoomId, chatMessageMap.get(selectRoomId));
        let chatMessageList = []
        if(!_.isNil(chatMessageMap.get(selectRoomId))){
            chatMessageList = chatMessageMap.get(selectRoomId)
        }
        let chatMessage = chatMessageList.map((item, i) => { 
            let messageClassName ;
            if(item.system){
                messageClassName = 'systemMessage'
            }else{
                if(item.isMe){
                    messageClassName = 'myMessage'
                }else if(!item.isMe){
                    messageClassName = 'anotherUserMessage'
                }
            }
            return (
                !item.isMe ? 
                <ChatItem userName =  {item.userName}
                          message ={item.message}
                          key = {i}
                />  :
                <div className = {messageClassName}>
                    {item.userName+ ": " + item.message }
                </div> 
            )
        })



        return (
            <div className ='chatRooWrapper' height = "100%">
                <button onClick = {getChatRoomList}>getChatRoomList</button>
                <button onClick = {deleteRedisKey}>deleteRedisKey</button>
                <div className = {'roomList'} >
                    <form className = {'searchBox'} onSubmit={this.handleSearch}>
                        <SearchOutlinedIcon/>
                        <TextField
                            id="input-with-icon-textfield"
                            placeholder="Search Contacts"
                            onChange={this.handleSearchKeyword}
                            onKeyDown={this.handleSearchCancel}
                            fullWidth={true}/>    
                        <ClearSharpIcon onClick = {this.removeSearchResult}/>
                    </form>
                    <ListGroup>
                        {this.searchResult}
                    </ListGroup>
                    <ListGroup>
                        {this.createListItem(roomNameList)}
                    </ListGroup>
                </div>
                <div className = 'chatRoom'>
                    <div className= 'message'>
                        {chatMessage}
                    </div>
                    <div className = "inputBox">
                        <form onSubmit={this.chatMessageSendServer} style = {{width:'100%'}}>
                            <TextField
                                id="inputMessage"
                                //label="메세지를 입력해주세요"
                                //className={classes.textField}
                                type='text' 
                                
                                name = 'inputMessage'
                                onChange ={this.handleChatMessage}
                                placeholder="message"
                            />
                            <input id="send-message" type = "submit" style = {{display: "none"}} />
                                <label htmlFor="send-message" type= "submit" style = {{margin:"0px"}}>
                                    <Button variant="contained" color="primary" onClick = {this.chatMessageSendServer} size = {'small'}>
                                        Send
                                        <Icon>send</Icon>
                                    </Button>
                                </label>
                        </form>    
                    </div>
                </div>
            </div>
        )
    }
}

export default inject(({ chat }) => ({
    chatMessageMap : chat.chatMessageMap,
    selectRoomId : chat.selectRoomId,
    roomNameList : chat.roomNameList,
    getChatRoomList : chat.getChatRoomList,
    roomNameList : chat.roomNameList,
    setSocketConnection : chat.setSocketConnection,
    sendChatMessage : chat.sendChatMessage,
    chatMessage : chat.chatMessage,
    joinChatRoom : chat.joinChatRoom,
    deleteRedisKey : chat.deleteRedisKey
  }))(observer( AdminChat));
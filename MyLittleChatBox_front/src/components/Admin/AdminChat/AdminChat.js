import React, { Component } from 'react'
import { ListGroup, ListGroupItem } from 'reactstrap';
import { observer, inject, } from 'mobx-react'
import TextField from '@material-ui/core/TextField';
import ChatItem from  '../../ChatView/ChatItem'

import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';

import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import {isEmpty} from 'lodash'
import ClearSharpIcon from '@material-ui/icons/ClearSharp';
import './AdminChat.scss';
import { symbols } from 'ansi-colors';

class AdminChat extends Component{
    state = {
        nickName : 'SEOYEON',
        chatMsg : '',
        temp : [],
        roomSelect : '',
        searchResult:[],
        roomList:[],
        //chatSocket : io('http://localhost:3031/chat')
    }
    componentDidMount(){
        const { getRoomList, setSocketConnection }  =this.props;
        setSocketConnection('admin')
        getRoomList();
        // setInterval(()=>{
        //     getRoomList();
        // },1000)
    }
    adminJoinRoom = (e) => {
        const {adminJoinRoom } =this.props;
        adminJoinRoom(e.target.name);
        console.log( e.target.name )   
        this.setState({
            roomSelect : e.target.name
        })
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
<<<<<<< HEAD
        sendChatMessage(chatMsg, nickName)
        document.getElementById('inputMessage').value = ''
=======
        sendChatMessage(chatMsg, 'ADMIN')
>>>>>>> feature/chatProtoLogic
        //this.sendChatMessage(this.state.chatMsg)
    }
    handleSearch = (e) =>{
        console.log("handleSearch##")
        e.preventDefault();
        const { roomNameList } = this.props
        
        document.getElementById('input-with-icon-textfield').value = ''

    }
    handleSearchKeyword = (e) => {
        const { roomNameList } = this.props;
        if(isEmpty(e.target.value)){
            console.log('none')
            this.setState({
                searchResult:[],
            })
            console.log(this.state.searchResult)
        }else{
            this.setState({
                searchResult: this.createListItem(roomNameList.filter(item=>{
                    console.log(item.includes(e.target.value))
                    return item.includes(e.target.value)
                }))
            })
        }        
        console.log(roomNameList)
    }
    createListItem = (list => {
        const {roomSelect} = this.state
        return list.map((item, i ) => {
            return(
                <ListGroupItem className ={ roomSelect === item ? 'active' : 'unactive' }
                               tag="button" 
                               onClick ={this.adminJoinRoom}
                               key = {i}
                               name={item} >{item}
                </ListGroupItem>
            )
        })
    })
    removeSearchResult = (e) =>{
        this.setState({
            searchResult:[],
        })
    }
    handleSearchCancel =(e) => {
        console.log(e.key)
        if(e.key === 'Escape'){
            console.log(e.target.key)
            this.setState({
                searchResult:[],
            })  
        }
    }
    render() {
        let { roomSelect } = this.state; 
        const { chatMessage } =this.props;
        console.log(this.state.roomList)
        let chatMessageList = chatMessage.map((item, i) =>{ 
            console.log(item)
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
<<<<<<< HEAD
                <div className = {messageClassName} key = {i}>{item.nickName+ ": " + item.msg }</div>
=======
                !item.isMe ?
                <ChatItem/> : 
                <div className = {messageClassName} >{item.userName+ ": " + item.message }</div>
             
>>>>>>> feature/chatProtoLogic
            )
        })
        return (
            <div className ='chatRooWrapper' height = "100%">

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
                        {this.state.searchResult}
                    </ListGroup>
                    <ListGroup>
                        {this.createListItem(this.props.roomNameList)}
                    </ListGroup>
                </div>
                <div className = {'chatRoom'} >
                    <div className= 'message'>
                        {chatMessageList}
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
    getRoomList : chat.getRoomList,
    roomNameList : chat.roomNameList,
    setSocketConnection : chat.setSocketConnection,
    sendChatMessage : chat.sendChatMessage,
    chatMessage : chat.chatMessage,
    adminJoinRoom : chat.adminJoinRoom
  }))(observer( AdminChat));
import React from 'react';
import styled from 'styled-components';

const St = {
  ChatItemWrapper: styled.div`
    display: flex;
    justify-content: ${(props) => (props.isMe ? 'flex-end' : 'end')};
  `,
  ChatItemMessage: styled.div`
    margin: 5px;
    border-radius: 13px;
    padding: 0.75rem 1.25rem;
    display: flex;
    justify-content: space-between;
    background-color: ${(props) => (props.isMe ? '#d0bfff' : '#fff')};
    max-width: 50%;
    word-break: break-all;
  `,
};

// if (item.system) {
//   messageClassName = 'system-message';
// } else {
//   if (item.isMe) {
//     messageClassName = 'myMessage';
//   } else if (!item.isMe) {
//     messageClassName = 'anotherUserMessage';
//   }
// }
const ChatItem = ({ item }) => {
  const { message, userName, isMe } = item;
  console.log('ITEM ', item);
  return (
    <St.ChatItemWrapper isMe={isMe}>
      {!isMe && userName}
      <St.ChatItemMessage isMe={isMe}>{message}</St.ChatItemMessage>
    </St.ChatItemWrapper>
  );
};

export default ChatItem;

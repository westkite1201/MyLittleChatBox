import React, { useRef } from 'react';
//import UseStores from '../../lib/UseStores';
import { observer } from 'mobx-react';

//커스텀 훅
// function useUserData() {
//   const { chat } = UseStores();
//   return useObserver(() => ({
//     chatMessageMap: chat.chatMessageMap,
//     selectRoomId: chat.selectRoomId
//   }));
// }
const ChatViewNew = observer(({ chat }) => {
  console.log('[seo] chat ', chat);
  ///const { chatMessageMap, selectRoomId } = useUserData();
  return <ul className="messages"></ul>;
});

export default ChatViewNew;

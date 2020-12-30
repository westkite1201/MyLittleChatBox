import React from "react";
//import UseStores from "../../lib/UseStores";
import { observer, useLocalObservable } from "mobx-react";
import useStore from "../../stores/useStore";

//커스텀 훅

const ChatViewNew = observer(() => {
  const { userStore, postStore } = useStore();

  const state = useLocalObservable(() => ({
    name: "",
    password: "",
    onChangeName(e) {
      this.name = e.target.value;
    },
  }));

  return (
    <ul className="messages">
      <button onClick={() => postStore.addPost("hello")}></button>
      {postStore.postLength}
    </ul>
  );
});

export default ChatViewNew;

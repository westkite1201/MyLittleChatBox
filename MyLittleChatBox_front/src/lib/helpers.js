import _ from 'lodash';
//닉네임 만들기
export const nicknameMaker = () => {
  //   let firstNameList = ['못되먹은','착해빠진','심술궂은', '징징대는'] ;
  //   let secondNameList = ['상어','오징어','구렁이','핑핑이']
  let firstNameList = ['A', 'B', 'C', 'D'];
  let secondNameList = ['1', '2', '3', '4'];
  let first = Math.floor(Math.random() * firstNameList.length - 1) + 1;
  let second = Math.floor(Math.random() * firstNameList.length - 1) + 1;
  return firstNameList[first] + ' ' + secondNameList[second];
};

export const makeRoomId = (userInfo) => {
  return userInfo.userName + '_' + this.socketId; // 룸_id
};

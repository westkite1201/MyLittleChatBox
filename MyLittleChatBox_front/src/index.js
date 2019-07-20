import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import './index.css';
//import './Loading.css'

import Root from './client/Root'
import RootStore from './stores';

const root = new RootStore(); // *** 루트 스토어 생성


ReactDOM.render(
  <Provider {...root}>
    <Root />
  </Provider>, document.getElementById('root'));

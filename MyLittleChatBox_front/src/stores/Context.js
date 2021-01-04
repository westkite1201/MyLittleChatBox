import * as React from 'react';
import { userStore, postStore } from './store';
import chatStore from './chatStore';

export const storeContext = React.createContext({
  userStore,
  postStore,
  chatStore,
});

export const StoreProvider = ({ children }) => {
  return <storeContext.Provider>{children}</storeContext.Provider>;
};

export default StoreProvider;

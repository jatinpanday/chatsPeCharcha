import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import socketMiddleware from './middleware/socketMiddleware';
import { userSlice } from './features/user/userSlice';
import chatReducer from './features/chat/chatSlice';
import { reduxLocalStorage } from "../imports/localStorage";

function saveToLocalStorage(state) {
  try {
    const storage = JSON.stringify(state);
    localStorage.setItem(reduxLocalStorage, storage);
  } catch (e) {
    console.warn(e);
  }
}

function loadFromLocalStorage() {
  try {
    const serialState = localStorage.getItem(reduxLocalStorage);
    if (serialState === null) return undefined;
    return JSON.parse(serialState);
  } catch (e) {
    console.warn(e);
    return undefined;
  }
}

const rootReducer = combineReducers({
  user: userSlice.reducer,
  chat: chatReducer,
});

const allMiddleWare = [logger, socketMiddleware];

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(allMiddleWare),
  preloadedState: loadFromLocalStorage(),
});

store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;

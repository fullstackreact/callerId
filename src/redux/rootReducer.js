import { combineReducers } from 'redux';
import { routerReducer as routing, push } from 'react-router-redux';

import * as webrtc from './modules/webrtc'

export let initialState = {};

export const actions = {
  routing: {
    navigateTo: path => dispatch => dispatch(push(path))
  },
  webrtc: webrtc.actions
}

export const rootReducer = combineReducers({
  routing,
  webrtc: webrtc.reducer
});

initialState.webrtc = webrtc.initialState || {};

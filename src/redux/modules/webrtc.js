import {createConstants, createReducer} from 'redux-module-builder'
import SimpleWebRTC from 'SimpleWebRTC'
import freeice from 'freeice'

let rtc = null;
export const types = createConstants('webrtc')(
  'INIT',
  'NEW_PEER_ADDED',

  'LOCAL_MEDIA_START',
  'LOCAL_MEDIA_ERROR',
  'LOCAL_MEDIA_STOP',

  'PEER_STREAM_ADDED',
  'PEER_STREAM_REMOVED',
  'CONNECTION_READY',

  'JOIN_ROOM',
  'LEAVE_ROOM'
)

export const reducer = createReducer({
  [types.INIT]: (state, {payload}) => ({
    ...state,
    webrtc: payload
  }),
  [types.CONNECTION_READY]: (state, {payload}) => ({
    ...state,
    ready: true,
    id: payload
  }),

  [types.LOCAL_MEDIA_START]: (state, {payload}) => ({
    ...state,
    localStream: payload
  }),

  [types.LOCAL_MEDIA_ERROR]: (state, {payload}) => ({
    ...state,
    localStreamError: payload
  }),

  [types.LOCAL_MEDIA_STOP]: (state, {payload}) => ({
    ...state,
    localStream: null
  }),

  [types.PEER_STREAM_ADDED]: (state, {payload}) => {
    const peers = rtc.webrtc.getPeers();
    return {...state, peers}
  },
  [types.PEER_STREAM_REMOVED]: (state, {payload}) => {
    const peers = rtc.webrtc.getPeers();
    return {...state, peers}
  },
  [types.JOIN_ROOM]: (state, {payload}) => ({
    ...state,
    currentRooms: state.currentRooms.concat(payload)
  }),
  [types.LEAVE_ROOM]: (state, {payload}) => {
    let currentRooms = [].concat(state.currentRooms);
    const idx = currentRooms.indexOf(payload);
    if (idx >= 0) {
      currentRooms.splice(idx, 1);
    }
    return {
      ...state,
      currentRooms
    }
  }
})

export const actions = {
  init: (cfg) => (dispatch, getState) => {
    rtc = new SimpleWebRTC({
      url: __TURN_SERVER__,
      debug: cfg.debug || false,
      peerConnectionConfig: freeice()
    });
    rtc
      .on('connectionReady', (id) => {
        dispatch({type: types.CONNECTION_READY, payload: id})
      })
      .on('createdPeer', (peer) => {
        dispatch({type: types.NEW_PEER_ADDED, payload: peer})
      })
      .on('peerStreamAdded', (peer) => {
        dispatch({type: types.PEER_STREAM_ADDED, payload: peer})
      })
      .on('peerStreamRemoved', (peer) => {
        dispatch({type: types.PEER_STREAM_REMOVED, payload: peer})
      });
    dispatch({type: types.INIT, payload: rtc});
  },
  joinRoom: (room) => {
    rtc.joinRoom(room);
    return {type: types.JOIN_ROOM, payload: room}
  },
  leaveRoom: (room) => {
    rtc.leaveRoom(room);
    return {type: types.LEAVE_ROOM, payload: room}
  },
  startLocalMedia: (config = {}) => (dispatch) => {
    const cfg = Object.assign({}, rtc.config.media, config)
    rtc.webrtc.startLocalMedia(cfg, (err, stream) => {
        if (err) {
          webrtc.emit('localMediaError', err);
          dispatch({type: types.LOCAL_MEDIA_ERROR, payload: err})
        } else {
          dispatch({type: types.LOCAL_MEDIA_START, payload: stream})
        }
    });
  },
  stopLocalMedia: () => {
    rtc.stopLocalVideo();
    return {
      type: types.LOCAL_MEDIA_STOP
    }
  }
}

export const initialState = {
  ready: false,
  peers: [],
  currentRooms: [],
  id: null,
  webrtc: null
}

export default reducer;

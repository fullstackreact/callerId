import {createConstants, createReducer} from 'redux-module-builder'
import SimpleWebRTC from 'SimpleWebRTC'
import freeice from 'freeice'

export const types = createConstants('webrtc')(
  'RTC_INIT',
  'NEW_PEER_ADDED',
  'PEER_STREAM_ADDED',
  'PEER_STREAM_REMOVED',
  'CONNECTION_READY',
  'JOIN_ROOM'
)

export const reducer = createReducer({
  [types.RTC_INIT]: (state, {payload}) => ({
    ...state,
    webrtc: payload
  }),
  [types.CONNECTION_READY]: (state, {payload}) => ({
    ...state,
    ready: true,
    id: payload
  }),
  [types.PEER_STREAM_ADDED]: (state, {payload}) => ({
    ...state,
    peers: state.peers.concat(payload)
  }),
  [types.PEER_STREAM_REMOVED]: (state, {payload}) => {
    let {peers} = state;
    const peerIds = peers.map(p => p.id);
    const idx = peerIds.indexOf(payload.id);
    peers.splice(idx, 1);
    return {...state, peers}
  },
  [types.JOIN_ROOM]: (state, {payload}) => ({
    ...state,
    currentRoom: payload
  })
})

let rtc = null;
export const actions = {
  init: (cfg) => (dispatch, getState) => {
    rtc = new SimpleWebRTC({
      url: __RTC_SERVER__,
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
    dispatch({type: types.RTC_INIT, payload: rtc});
  },
  newPeer: (peer) => ({type: types.NEW_PEER_ADDED, payload: peer}),
  removePeer: (peer) => ({type: types.PEER_STREAM_REMOVED, payload: peer}),
  joinRoom: (room) => {
    rtc.joinRoom(room);
    return {type: types.JOIN_ROOM, payload: room}
  }
}

export const initialState = {
  ready: false,
  peers: [],
  id: null,
  webrtc: null
}

export default reducer;

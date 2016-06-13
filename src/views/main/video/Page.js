import React, { PropTypes as T } from 'react'
import ReactDOM from 'react-dom'

import btnStyles from 'styles/buttons.css';
import styles from './styles.module.css'

import Chance from 'chance'
import {connect} from 'react-redux'
import Room from 'components/Rooms/Room'

export class VideoIndex extends React.Component {
  componentDidMount() {
    const {actions, params} = this.props;
    actions.webrtc.init({debug: false});

    this.startLocalMedia(this.props.ready);

    if (params && params.roomName) {
      this.joinRoom(params.roomName);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ready !== this.props.ready) {
      this.startLocalMedia(nextProps.ready);
    }

    if (nextProps.params && nextProps.params.roomName &&
        nextProps.params.roomName !== this.props.params.roomName) {
      const {webrtc, actions} = this.props;
      this.joinRoom(nextProps.params.roomName);
    }
  }

  joinRoom(roomName) {
    const {webrtc, actions} = this.props;
    actions.webrtc.joinRoom(roomName);
  }

  startLocalMedia(ready) {
    if (ready) {
      const {webrtc, actions} = this.props;
      actions.webrtc.startLocalMedia();
    }
  }

  leaveRoom(roomName) {
    const {actions} = this.props;
    actions.webrtc.leaveRoom(roomName);
    actions.routing.navigateTo('/')
  }

  render() {
    const {params} = this.props;
    const roomName = params.roomName;

    return (
      <div className={styles.container}>
        <div className={[styles.grid]}>
          <div className={styles.row}>
            <Room name={roomName}
                  leaveRoom={this.leaveRoom.bind(this)}
                  localStream={this.props.localStream}
                  {...this.props} />
          </div>
        </div>
      </div>
    )
  }
}

VideoIndex.contextTypes = {
  router: T.object
}

export default connect(state => ({
  id: state.webrtc.id,
  localStream: state.webrtc.localStream,
  ready: state.webrtc.ready,
  peers: state.webrtc.peers
}))(VideoIndex);

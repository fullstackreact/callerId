import React, { PropTypes as T } from 'react'
import ReactDOM from 'react-dom'

import formStyles from 'styles/forms.css'
import styles from './styles.module.css'

import Chance from 'chance'
import {connect} from 'react-redux'
import Room from 'components/Rooms/Room'

export class Index extends React.Component {
  componentDidMount() {
    const {actions, params} = this.props;
  }

  goToAbout(evt) {
    const {router} = this.context;
    const {actions} = this.props;
    actions.routing.navigateTo('about');
    return false;
  }

  newChat(evt) {
    evt.preventDefault();
    const {actions} = this.props;
    let roomName = this.refs.roomName && this.refs.roomName.value;
    roomName = roomName || chance.word({length: 8});
    actions.routing.navigateTo(`room/${roomName}`)
    return false;
  }

  leaveRoom(roomName) {
    const {actions} = this.props;
    actions.webrtc.leaveRoom(roomName);
  }

  render() {
    const {currentRooms} = this.props;

    return (
      <div className={styles.container}>
        <div className={[styles.grid]}>
          <div className={[styles.row, styles.smallRow]}>
            <div className={styles.actions}>
              <form className={formStyles.form}
                    onSubmit={this.newChat.bind(this)}>
                <input name="roomName"
                    ref="roomName"
                    className={[formStyles.input]}
                    placeholder="Get a room (or leave blank for randomly generated one)" />
                <input type="submit"
                    className={[formStyles.btn, styles.actions].join(' ')}
                    onClick={this.newChat.bind(this)}
                    value="New chat" />
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Index.contextTypes = {
  router: T.object
}

export default connect(state => ({
  webrtc: state.webrtc.webrtc,
  id: state.webrtc.id,
  localStream: state.webrtc.localStream,
  ready: state.webrtc.ready,
  peers: state.webrtc.peers,
  currentRooms: state.webrtc.currentRooms
}))(Index);

import React from 'react'

import VideoView from 'components/Video/VideoView'
import styles from './styles.module.css'

export class Room extends React.Component {
  leaveRoom(room, evt) {
    this.props.leaveRoom(room);
  }
  render() {
    const {name, ready, peers, localStream} = this.props;

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>{name}</div>
          <div onClick={this.leaveRoom.bind(this, name)}
                className={styles.controls}>
            <i className="fa fa-close"></i>
          </div>
        </div>
        <div className={styles.videoContainer}>

          <div className={styles.main}>
            <VideoView ready={ready}
                stream={localStream} />
          </div>

          <div className={styles.peers}>
            <div className={styles.invited}>
              <i className="fa fa-user-plus"></i>
              Invite
            </div>
            <div className={styles.people}>
              {peers.map(peer => {
                return (
                  <div key={peer.id} className={styles.person}>
                    <VideoView
                      ready={ready}
                      stream={peer.stream} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.location}>
              <i className="fa fa-map-marker"></i>
              San Francisco, CA
            </div>
            <div className={styles.time}>
              <i className="fa fa-clock-o"></i>
              2:00pm - 2:30pm
            </div>
          </div>

        </div>
      </div>
    )
  }
}

export default Room;

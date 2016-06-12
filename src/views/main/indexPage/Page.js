import React, { PropTypes as T } from 'react'
import ReactDOM from 'react-dom'
import styles from './styles.module.css'

import {connect} from 'react-redux'
import VideoView from 'components/Chat/VideoView'

export class Index extends React.Component {
  componentDidMount() {
    const {actions} = this.props;
    actions.webrtc.init({debug: false});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ready && !this.props.ready) {
      this.startLocalMedia();
    }
  }

  startLocalMedia() {
    const {webrtc, actions} = this.props;
    actions.webrtc.joinRoom('fullstackio');
    actions.webrtc.startLocalMedia();
  }

  goToAbout(evt) {
    const {router} = this.context;
    const {actions} = this.props;
    actions.routing.navigateTo('about');
    return false;
  }

  render() {
    const {ready, peers, localStream} = this.props;

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Video chat</div>
          <div className={styles.controls}>
            <i className="fa fa-close"></i>
          </div>
        </div>
        <div className={styles.videoContainer}>

          <div className={styles.main}>
            <VideoView key={'mine'}
                ready={ready}
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

Index.contextTypes = {
  router: T.object
}

export default connect(state => ({
  webrtc: state.webrtc.webrtc,
  id: state.webrtc.id,
  localStream: state.webrtc.localStream,
  ready: state.webrtc.ready,
  peers: state.webrtc.peers,
}))(Index);

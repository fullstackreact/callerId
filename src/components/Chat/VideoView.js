import React, { PropTypes as T } from 'react'
import ReactDOM from 'react-dom'

import styles from './styles.module.css';

import attachMediaStream from 'attachmediastream'

export class VideoView extends React.Component {
  static propTypes = {
    ready: T.bool,
    remote: T.bool,
    peer: T.object
  }

  componentDidMount() {
    if (this.props.ready) {
      this.attachVideo();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ready !== this.props.ready || nextProps.peer !== this.props.peer) {
      this.attachVideo();
    }
  }

  attachVideo() {
    console.log('attachVideo ->', this.props);
    this.props.remote ? this.attachRemoteVideo() : this.attachLocalVideo()
  }

  attachRemoteVideo() {
    const {peer} = this.props;
    let node = ReactDOM.findDOMNode(this.refs.videoView);
    attachMediaStream(peer.stream, node);
  }

  attachLocalVideo() {
    const {rtc} = this.props;

    let node = ReactDOM.findDOMNode(this.refs.videoView);
    rtc.webrtc.startLocalMedia(rtc.config.media, function (err, stream) {
      if (err) {
          rtc.emit('localMediaError', err);
      } else {
        attachMediaStream(stream, node, rtc.config.localVideo);
      }
    });
  }

  render() {
    return (
      <div className={styles.container}>
        <video className={styles.video} ref='videoView'></video>
      </div>
    )
  }
}

export default VideoView

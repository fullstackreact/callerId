import React, { PropTypes as T } from 'react'
import ReactDOM from 'react-dom'

import styles from './styles.module.css';

import attachMediaStream from 'attachmediastream'

export class VideoView extends React.Component {
  static propTypes = {
    ready: T.bool,
    remote: T.bool,
    stream: T.object,
    peer: T.object
  }

  componentDidMount() {
    if (this.props.ready && this.props.stream) {
      this.attachVideo(this.props.stream);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ready && nextProps.stream) {
      this.attachVideo(nextProps.stream);
    }
  }

  attachVideo(stream) {
    let node = ReactDOM.findDOMNode(this.refs.videoView);
    attachMediaStream(stream, node);
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

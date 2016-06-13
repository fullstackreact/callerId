import React, { PropTypes as T } from 'react'
import ReactDOM from 'react-dom'
import attachMediaStream from 'attachmediastream'

import styles from './styles.module.css';

export class VideoView extends React.Component {
  static propTypes = {
    ready: T.bool,
    stream: T.object
  }

  componentDidMount() {
    if (this.props.ready && this.props.stream) {
      this.attachVideo(this.props.stream);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ready && nextProps.stream !== this.props.stream) {
      this.attachVideo(nextProps.stream);
    }
  }

  attachVideo(stream) {
    let node = ReactDOM.findDOMNode(this.refs.videoView);
    attachMediaStream(stream, node);
  }

  render() {
    return (
      <div className={styles.videoContainer}>
        <video className={styles.video}
                ref='videoView' />
      </div>
    )
  }
}

export default VideoView

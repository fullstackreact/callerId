import React, { PropTypes as T } from 'react'

class ChatBox extends React.Component {
  render() {
    return (
      <div>
        <h2>Messages</h2>
        {this.props.messages.map(msg => {
          <div>{{ msg }}</div>
        })}
      </div>
    )
  }
}

export default ChatBox

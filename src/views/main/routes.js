import React from 'react'
import {Route, IndexRoute} from 'react-router'

import Container from './Container'
import About from './about/About'
import IndexPage from './indexPage/Page'
import VideoPage from './video/Page'

export const makeMainRoutes = () => {
  return (
    <Route path='/' component={Container}>
      <Route path="about" component={About} />
      <Route path="room/:roomName" component={VideoPage} />
      <IndexRoute component={IndexPage} />
    </Route>
  )
}

export default makeMainRoutes

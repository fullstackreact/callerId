import React from 'react'
import {Route, IndexRoute} from 'react-router'

import Container from './Container'
import About from './about/About'
import IndexPage from './indexPage/Page'

export const makeMainRoutes = () => {
  return (
    <Route path='/' component={Container}>
      <Route path="about" component={About} />
      <IndexRoute component={IndexPage} />
    </Route>
  )
}

export default makeMainRoutes

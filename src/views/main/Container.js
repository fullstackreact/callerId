import React, { PropTypes as T } from 'react'
import Header from 'components/Header/Header'
import styles from './styles.module.css'

export class Container extends React.Component {

  goToAbout() {
    const {actions} = this.props;
    const {routing} = actions;
    routing.navigateTo('/about');
  }

  render() {
    let {actions, children} = this.props;
    return (
      <div className={styles.wrapper}>
        <Header tite="callerId" />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    )
  }
}

Container.contextTypes = {
  router: T.object
}

Container.propTypes = {
  actions: T.object,
  children: T.element
}

export default Container

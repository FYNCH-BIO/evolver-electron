import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';


class Navbar extends Component {
  render() {
    return (
      <nav className="site-header sticky-top py-1 centered navBar">
        <div className="container col-sm-4 d-flex flex-column flex-md-row justify-content-between">
          <Link className="py-2 d-none d-md-inline-block text-dark" id="experiments" to={routes.HOME}>HOME</Link>
          <Link className="py-2 d-none d-md-inline-block text-dark" id="experiments" to={routes.SETUP}>SETUP</Link>
          <Link className="py-2 d-none d-md-inline-block text-dark" id="experiments" to={routes.COUNTER}>COUNTER</Link>
        </div>
      </nav>
    )
  }
}

export default Navbar

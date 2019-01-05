/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import SetupPage from './containers/SetupPage';
import CalibrationsPage from './containers/CalibrationsPage';

export default () => (
  <App>
    <Switch>
      <Route exact path={routes.HOME} component={HomePage} />
      <Route exact path={routes.SETUP} component={SetupPage} />
      <Route exact path={routes.CALIBRATIONS} component={CalibrationsPage} />
    </Switch>
  </App>
);

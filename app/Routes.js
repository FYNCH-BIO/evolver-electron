/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import SetupPage from './containers/SetupPage';
import DensityCalibrationsPage from './containers/DensityCalibrationsPage';
import GraphingPage from './containers/GraphingPage';
import ExptManagerPage from './containers/ExptManagerPage';
import TempCalibrationsPage from './containers/TempCalibrationsPage';
import CalibrationsMenuPage from './containers/CalibrationsMenuPage';
import ScriptEditorPage from './containers/ScriptEditorPage';


export default () => (
  <App>
    <Switch>
      <Route exact path={routes.HOME} component={HomePage} />
      <Route exact path={routes.SETUP} component={SetupPage} />
      <Route exact path={routes.CALMENU} component={CalibrationsMenuPage} />
      <Route exact path={routes.DENSITYCALIBRATIONS} component={DensityCalibrationsPage} />
      <Route exact path={routes.TEMPCALIBRATIONS} component={TempCalibrationsPage} />
      <Route exact path={routes.GRAPHING} component={GraphingPage} />
      <Route exact path={routes.EXPTMANAGER} component={ExptManagerPage} />
      <Route exact path={routes.EDITOR} component={ScriptEditorPage} />
    </Switch>
  </App>
);

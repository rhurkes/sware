import * as React from 'react';
import { render } from 'react-dom';
import { IndexRoute, Route, Router, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import AppContainer from './modules/app/appContainer';
import HomeContainer from './pages/home/homeContainer';
import EventsContainer from './pages/events/eventsContainer';
import EventsConfigContainer from './pages/events/eventsConfigContainer';
import GOES16Container from './pages/goes16/goes16Container';
import GOES16ConfigContainer from './pages/goes16/goes16ConfigContainer';
import { default as store } from './utility/store';

render((
  <Provider store={store} >
    <Router history={hashHistory}>
      <Route path="/" component={AppContainer}>
        <IndexRoute component={HomeContainer} />
        <Route path="events" component={EventsContainer}>
          <Route path="config" component={EventsConfigContainer} />
        </Route>
        <Route path="goes16" component={GOES16Container}>
          <Route path="config" component={GOES16ConfigContainer} />
        </Route>
      </Route>
    </Router>
  </Provider>
), document.getElementById('app'));

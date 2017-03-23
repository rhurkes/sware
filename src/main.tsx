import * as React from 'react';
import { render } from 'react-dom';
import { IndexRoute, Route, Router, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import AppContainer from './modules/app/appContainer';
import HomeContainer from './pages/home/homeContainer';
import EventsContainer from './pages/events/eventsContainer';
import EventsConfigContainer from './pages/events/eventsConfigContainer';
import { default as store } from './utility/store';

render((
  <Provider store={store} >
    <Router history={hashHistory}>
      <Route path="/" component={AppContainer}>
        <IndexRoute component={HomeContainer} />
        <Route path="events" component={EventsContainer}>
          <Route path="config" component={EventsConfigContainer} />
        </Route>
      </Route>
    </Router>
  </Provider>
), document.getElementById('app'));

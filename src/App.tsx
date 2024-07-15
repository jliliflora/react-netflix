import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './Routes/Home';
import Tv from './Routes/Tv';
import Search from './Routes/Search';
import Header from './Components/Header';

function App() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/tv">
          <Tv />
        </Route>
        <Route path="/search">
          <Search />
        </Route>
        {/* 이 root경로를 젤 마지막에 넣어줘야함 */}
        <Route path="/">
          <Home />
        </Route> 
      </Switch>
    </>
  );
}

export default App;

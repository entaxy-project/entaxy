import React from 'react';
import Header from './common/Header';
import Routes from './routes';
import 'typeface-roboto'

const App = ({ history }) => (
  <div>
    <Header/>
    <Routes history= {history}/>
  </div>
)

export default App

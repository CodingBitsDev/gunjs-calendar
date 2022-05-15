import GUN, {user} from "./gun/index"
import {login, signUp, canRecall, recall} from "./gun/auth"

import logo from './logo.svg';
import './App.css';
import Router from "./Router";

function App() {
  return (
    <div className="App">
      <Router/>
    </div>
  );
}

export default App;

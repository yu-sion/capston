import Login from './User/Login';
import Info from './User/Info';
import Home from './component/Home';
import {
  BrowserRouter as Router,
  Route, Switch
} from 'react-router-dom';
import { useState } from 'react';


function App() {
  const [userData,setUserData] = useState()

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path='/'>
            <Login />
          </Route>
          <Route exact path='/Info'>
            <Info  setUserData={setUserData} userData={userData}/>
          </Route>
          <Route exact path='/Home'>
            <Home userData={userData} setUserData={setUserData}/>
          </Route>
          {/* <Route exact path='/data'>
            <Data />
          </Route> */}
          </Switch>
      </Router>
    </div>
  );
}

export default App;
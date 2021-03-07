import Login from './User/Login';
import Info from './User/Info';
import Home from './component/Home';
import StdClass from "./component/StdClass";
import TeacherClass from "./component/TeacherClass";
import Replay from "./component/Replay";
import {
  BrowserRouter as Router,
  Route, Switch
} from 'react-router-dom';
import { useState } from 'react';

/*

*/

const userData = {

}
const classData = {
  className : null,
  classId : null,
  teacherName : null,
}
const videoData = {
  fileName : null,
}

const data = {
  classId : null,
  className : null,
  teacherName : null,

  userId : null,

  fileName : null,
  videoId : null,
}

function App() {
  const [userData,setUserData] = useState();
  const [getData, setData] = useState(data);
  console.log(data);
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
            <Home userData={userData} setUserData={setUserData} data={setData} getData={getData}/>
          </Route>
          <Route exact path='/stdClass'>
            <StdClass data={getData}/>
          </Route>
          <Route exact path='/replay'>
            <Replay  data={getData}/>
          </Route>
          <Route exact path='/teacherClass'>
            <TeacherClass  data={getData}/>
          </Route>

          </Switch>
      </Router>
    </div>
  );
}

export default App;
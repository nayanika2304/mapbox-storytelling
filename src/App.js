import React from 'react';
import Map from './components/Map';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import { Landing } from './components/Landing';


const App = () => {
  return (
    <Router>
           <div className="App">
           <Routes>
                 <Route exact path='/' element={< Landing/>}></Route>
                 <Route exact path='/story' element={< Map />}></Route>
          </Routes>
          </div>
       </Router>
  );
}

export default App;

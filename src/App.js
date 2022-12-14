import React from 'react';
import StoryMap from './components/StoryMap';
import GlacierMap from './components/GlacierMap';
import BikePhilly from './components/BikePhilly';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import { Landing } from './components/Landing';


const App = () => {
  return (
    <Router>
           <div className="App">
           <Routes>
                 <Route exact path='/' element={< Landing/>}></Route>
                 <Route exact path='/story' element={< StoryMap/>}></Route>
                 <Route exact path='/glacier' element={<GlacierMap/>}></Route>
                 <Route exact path='/bike' element={<BikePhilly/>}></Route>
          </Routes>
          </div>
       </Router>
  );
}

export default App;

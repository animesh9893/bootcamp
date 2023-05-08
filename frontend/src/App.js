import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignUp,{Login} from './component/SignUp';

import Home from './component/Home';
import Protected from './component/Protected';
import Note from './component/Note';
import Error from './component/Error';


function App() {
  return (
    <div style={{minHeight:"100vh",backgroundColor:"wheat",width:"100vw"}}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Protected><Home/></Protected>} />
          <Route path='/note/:id' element={<Protected><Note/></Protected>} />
          <Route path='/error' element={<Error/>} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/login' element={<Login />} />
          <Route path='*' element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

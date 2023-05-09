import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignUp,{Login, ResetPassword, ResetRequest} from './component/SignUp';

import Home from './component/Home';
import Protected from './component/Protected';
import Note from './component/Note';
import Error from './component/Error';
import CreateNote from './component/CreateNote';
import Profile from './component/Profile';
import { NormalNav } from './component/Navbar';
import CreatedNote from './component/CreatedNotes';
import SharedNote from './component/SharedNotes';
import CSVtoNote from './component/CSVtoNote';
function App() {
  return (
    <div style={{minHeight:"100vh",backgroundColor:"wheat",width:"100vw"}}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Protected><Home/></Protected>} />
          <Route path='/createdNotes' element={<Protected><CreatedNote/></Protected>} />
          <Route path='/note/create' element={<Protected><CreateNote/></Protected>}/>
          <Route path='/noteShared' element={<Protected><SharedNote/></Protected>}/>
          <Route path='/csvToNote' element={<Protected><CSVtoNote/></Protected>}/>
          <Route path='/note/:id' element={<Protected><Note/></Protected>} />
          <Route path='/profile/:id' element={<Protected><Profile/></Protected>} />
          <Route path='/error' element={<NormalNav><Error/></NormalNav>} />
          <Route path='/signup' element={<NormalNav><SignUp/></NormalNav>} />
          <Route path='/login' element={<NormalNav><Login/></NormalNav>} />
          <Route path='/reset' element={<NormalNav><ResetRequest/></NormalNav>} />
          <Route path='/reset/:token' element={<NormalNav><ResetPassword/></NormalNav>} />
          
          <Route path='*' element={<NormalNav><Login/></NormalNav>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

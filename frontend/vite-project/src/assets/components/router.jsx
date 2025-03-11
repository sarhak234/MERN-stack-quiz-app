import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './login';
import AdminPannel from './adminpannel';
import AdminLogin from './adminlogin';
import Layout from './layout'
import Result from './result'
import AdminDashboard from './admindashboard'


function RouterComponent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/adminlogin" element={<AdminLogin/>} />
        <Route path="/adminpannel" element={<AdminPannel/>} />
        <Route path='/layout' element={<Layout/>}/>
        <Route path='/admindashboard' element={<AdminDashboard/>}/>
        <Route path='/result' element={<Result/>}/>
      </Routes>
    </Router>
  );
}

export default RouterComponent;

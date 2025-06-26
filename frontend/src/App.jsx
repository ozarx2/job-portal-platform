// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoginForm from './components/auth/LoginForm';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Signup from './pages/Signup';  


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;


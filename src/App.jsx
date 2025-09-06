// rafce
import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatBot from './components/ChatBot';

const App = () => {
  // Javascript


  return (
    <>
     <ToastContainer />
     <AppRoutes />
     <ChatBot/>
    </>
  )
}

export default App
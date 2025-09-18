// App.jsx
import React, { Fragment } from 'react'
import AppRoutes from './routes/AppRoutes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ChatBot from './components/ChatBot'

const App = () => {
  return (
    <Fragment>
      <ToastContainer />
      <AppRoutes />
      <ChatBot />
    </Fragment>
  )
}

export default App

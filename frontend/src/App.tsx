import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import AuthCallbackPage from './pages/auth-callback/AuthCallbackPage'
import { Button } from "./components/ui/button"


function App() {
  return (
       <>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth-callback" element={<AuthCallbackPage />} />
        </Routes>
      </>
  )
  
}

export default App

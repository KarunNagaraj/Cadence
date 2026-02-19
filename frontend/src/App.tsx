import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import AuthCallbackPage from './pages/auth-callback/AuthCallbackPage'
import { Button } from "./components/ui/button"
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'


function App() {
  return (
       <>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path='/sso-callback' element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />} />
          {/*Above code is used after logging in from google, if the user is new it will redirect to /auth-callback with the user details
          and if the user is existing it will directly log in and redirect to home page,
          So /sso-callback is not a UI page for your app; it is a technical callback handler page for Clerk auth completion.*/}
          <Route path="/auth-callback" element={<AuthCallbackPage />} />
        </Routes>
      </>
  )
  
}

export default App

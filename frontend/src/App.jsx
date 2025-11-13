import { useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'react-hot-toast'

import { HomePage, ProblemsPage } from './pages'

const App = () => {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/problems' element={isSignedIn ? <ProblemsPage /> : <Navigate to={'/'} />} />
      </Routes>

      <Toaster />
    </>
  )
}

export default App 
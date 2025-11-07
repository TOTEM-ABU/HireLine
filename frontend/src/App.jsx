import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

const App = () => {
  return (
    <div>
      <SignedOut>
        <SignInButton mode='modal'>
          <button>
            Login
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignedOut />
      </SignedIn>

      <UserButton />
    </div>
  )
}

export default App
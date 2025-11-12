import { SignedOut, SignInButton, SignedIn, UserButton, SignOutButton } from '@clerk/clerk-react'

const HomePage = () => {
    return (
        <div>
            <button className='btn btn-secondary'>Click</button>

            <SignedOut>
                <SignInButton mode='modal'>
                    <button>
                        Login
                    </button>
                </SignInButton>
            </SignedOut>

            <SignedIn>
                <SignOutButton />
            </SignedIn>

            <UserButton />
        </div>
    )
}

export default HomePage
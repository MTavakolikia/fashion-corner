import { SignIn } from '@clerk/nextjs'
import React from 'react'

function SignInPage() {
    return (
        <div className='h-screen w-full grid place-content-center'>
            <SignIn />
        </div>
    )
}

export default SignInPage
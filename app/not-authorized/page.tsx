import React from 'react'

const UnauthorizedPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900">
            <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
                    400, UnAuthorized!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                    Log in with authorized access!
                </p>
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-indigo-600 hover:underline">
                        Sign up
                    </a>
                </p>
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Have an account?{" "}
                    <a href="/login" className="text-indigo-600 hover:underline">
                        Login in
                    </a>
                </p>
            </div>
        </div>
    )
}

export default UnauthorizedPage

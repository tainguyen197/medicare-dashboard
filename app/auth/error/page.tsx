"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication.";

  if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password.";
  } else if (error === "AccessDenied") {
    errorMessage = "You do not have permission to access this resource.";
  } else if (error === "CallbackRouteError") {
    errorMessage = "There was a problem with the authentication callback.";
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Authentication Error
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            {errorMessage}
          </div>
          <div className="flex justify-center">
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

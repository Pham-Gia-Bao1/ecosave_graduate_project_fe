import React from "react";
import LoginPage from "./LoginPage"; // Assuming this is the login page component
import api from "@/api"; // Function to fetch CSRF token from your API

// Server Component to fetch the CSRF token
export default async function Page() {
  try {
    return (
      <div>
        {/* Pass CSRF token to the LoginPage component */}
        <LoginPage />
      </div>
    );
  } catch (error) {
    console.log(error);
  }
}

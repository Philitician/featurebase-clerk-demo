// app/login/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useSignIn, useClerk, useSession } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

// --- Configuration ---
const DEFAULT_REDIRECT_URL = "/"; // Default redirect if return_to is invalid/missing
const ALLOW_EXTERNAL_REDIRECTS = true; // Set to false to disable external redirects
// ---------------------

export default function CustomSignInPage() {
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { loaded: isClerkLoaded } = useClerk(); // Use client for session checks if needed
  const { isLoaded: isSessionLoaded, isSignedIn } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedReturnUrl, setValidatedReturnUrl] =
    useState<string>(DEFAULT_REDIRECT_URL);
  const [isValidatingUrl, setIsValidatingUrl] = useState(true); // Track URL validation

  // --- Step 1: Validate the return_to URL ---
  useEffect(() => {
    const returnTo = searchParams.get("return_to");
    let finalRedirect = DEFAULT_REDIRECT_URL;

    if (returnTo) {
      console.log(`Found return_to parameter: ${returnTo}`);
      try {
        const url = new URL(returnTo);
        if (url.protocol === "http:" || url.protocol === "https:") {
          const isExternal = url.origin !== window.location.origin;
          if (isExternal && !ALLOW_EXTERNAL_REDIRECTS) {
            console.warn(
              `External redirect to "${returnTo}" disabled. Falling back to default.`
            );
            finalRedirect = DEFAULT_REDIRECT_URL;
          } else {
            console.log(
              `Validated return_to URL: ${returnTo} (External: ${isExternal})`
            );
            finalRedirect = returnTo;
          }
        } else {
          console.warn(
            `Invalid protocol in return_to URL: "${returnTo}". Falling back.`
          );
          finalRedirect = DEFAULT_REDIRECT_URL;
        }
      } catch (err) {
        console.warn(
          `Invalid return_to URL format: "${returnTo}". Falling back.`,
          err
        );
        finalRedirect = DEFAULT_REDIRECT_URL;
      }
    } else {
      console.log("No return_to parameter found. Using default redirect.");
      finalRedirect = DEFAULT_REDIRECT_URL;
    }

    setValidatedReturnUrl(finalRedirect);
    setIsValidatingUrl(false); // Validation complete
  }, [searchParams]); // Only depends on searchParams

  // --- Step 2: Redirect if already signed in ---
  // This effect runs after URL validation and when session status changes
  useEffect(() => {
    if (!isSessionLoaded || isValidatingUrl) {
      return; // Wait for session and URL validation
    }

    if (isSignedIn) {
      console.log(
        "User already signed in, redirecting to:",
        validatedReturnUrl
      );
      // Use window.location.href for external redirects if router.push has issues
      // router.push(validatedReturnUrl); // Might have issues with full external URLs
      window.location.href = validatedReturnUrl;
    }
  }, [
    isSignedIn,
    isSessionLoaded,
    isValidatingUrl,
    validatedReturnUrl,
    router,
  ]);

  // --- Step 3: Handle Password Sign-In ---
  const handlePasswordSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded) return;

    setLoading(true);
    setError(null);

    try {
      // Start the sign-in process
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password, // Include password directly here for basic password strategy
      });

      console.log("Sign in attempt status:", signInAttempt.status);

      if (signInAttempt.status === "complete") {
        // Sign in successful, set the active session
        await setActive({ session: signInAttempt.createdSessionId });
        console.log("Sign in complete! Redirecting to:", validatedReturnUrl);
        // Redirect user to the validated URL
        // Use window.location.href for reliable external redirects
        window.location.href = validatedReturnUrl;
      } else if (signInAttempt.status === "needs_second_factor") {
        // Handle MFA/2FA if needed (requires additional UI/logic)
        setError(
          "Multi-factor authentication required. (Not implemented in this example)"
        );
        console.error("MFA Required:", signInAttempt);
      } else {
        // Other statuses might indicate errors or different flows needed
        setError(`Sign-in failed. Status: ${signInAttempt.status}`);
        console.error("Sign in status not complete:", signInAttempt);
      }
    } catch (err: any) {
      // Handle errors (e.g., incorrect password, user not found)
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.message ||
        "An unknown error occurred.";
      console.error("Sign-in error:", JSON.stringify(err, null, 2));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- (Optional) Handle OAuth Sign-In ---
  const handleOAuthSignIn = async (
    strategy: "oauth_google" | "oauth_github" /* | etc */
  ) => {
    if (!isSignInLoaded) return;
    setLoading(true);
    setError(null);
    try {
      // Pass the *final* desired redirect URL after successful OAuth + session activation
      // Clerk uses this after the OAuth provider redirects back and the session is set.
      // IMPORTANT: The page needs to handle the state correctly when the user returns
      // from the OAuth provider before the session is active. The `isSignedIn` check
      // in the useEffect should eventually catch this and perform the redirect.
      await signIn.authenticateWithRedirect({
        strategy: strategy,
        redirectUrl: "/sso-callback", // A route handled by Clerk to process the OAuth response
        redirectUrlComplete: validatedReturnUrl, // Where to go *after* SSO callback succeeds
      });
      // Note: User is redirected away here. The redirect back will be handled by Clerk
      // and the useEffect checking isSignedIn should trigger the final redirect.
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage || err.message || "OAuth failed.";
      console.error(`OAuth (${strategy}) error:`, JSON.stringify(err, null, 2));
      setError(errorMessage);
      setLoading(false); // Stop loading only if redirect didn't happen
    }
    // No finally setLoading(false) here, as user should be redirected away
  };

  // --- Render Logic ---
  if (
    !isSignInLoaded ||
    !isClerkLoaded ||
    !isSessionLoaded ||
    isValidatingUrl
  ) {
    return <div>Loading...</div>; // Combined loading state
  }

  // If signed in, the useEffect should handle the redirect, show message meanwhile
  if (isSignedIn) {
    return <div>Already signed in. Redirecting...</div>;
  }

  // If not signed in, show the form
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>Sign In</h2>
        <form
          onSubmit={handlePasswordSignIn}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Optional: Add OAuth Buttons */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>Or sign in with:</p>
          <button
            onClick={() => handleOAuthSignIn("oauth_google")}
            disabled={loading}
            style={{
              padding: "10px",
              margin: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "..." : "Sign in with Google"}
          </button>
          {/* Add buttons for other providers (GitHub, etc.) similarly */}
          {/* <button onClick={() => handleOAuthSignIn('oauth_github')} disabled={loading}>Sign in with GitHub</button> */}
        </div>
        {/* --- Security Warning --- */}
        <p style={{ marginTop: "15px", fontSize: "0.8em", color: "#666" }}>
          <strong>Security Note:</strong> Ensure external redirects
          (`return_to`) are only allowed for trusted domains in production by
          modifying the validation logic.
        </p>
      </div>
    </div>
  );
}

import { userStore } from "../store/userStore";
import { baseUserApi } from "../api";


const KEYCLOAK_AUTH_URL = `${import.meta.env.VITE_KEYCLOAK_AUTH_URL}/protocol/openid-connect/auth`;
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_KEYCLOAK_REDIRECT_URI;
const KEYCLOAK_TOKEN_URL = `${import.meta.env.VITE_KEYCLOAK_AUTH_URL}/protocol/openid-connect/token`;
const KEYCLOAK_USERINFO_URL = `${import.meta.env.VITE_KEYCLOAK_AUTH_URL}/protocol/openid-connect/userinfo`;

// Generate a random string for PKCE
const generateRandomString = (length: number) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Generate code verifier for PKCE
const generateCodeVerifier = () => {
  return generateRandomString(128);
};

// Generate code challenge from verifier
const generateCodeChallenge = async (verifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const initiateKeycloakLogin = async () => {
  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier for later use
  localStorage.setItem("code_verifier", codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: "openid email profile roles",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  window.location.href = `${KEYCLOAK_AUTH_URL}?${params.toString()}`;
};

export const handleKeycloakCallback = async (
  code: string,
  navigate?: (path: string) => void
) => {
  try {
    // Get the stored code verifier
    const codeVerifier = localStorage.getItem("code_verifier");
    if (!codeVerifier) {
      throw new Error("No code verifier found");
    }

    // Exchange the code for tokens
    const tokenResponse = await fetch(KEYCLOAK_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokenData = await tokenResponse.json();

    // Get user info using the access token
    const userInfoResponse = await fetch(KEYCLOAK_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error("Failed to get user info");
    }

    const userData = await userInfoResponse.json();

    // Store the tokens in localStorage
    localStorage.setItem("access_token", tokenData.access_token);
    localStorage.setItem("refresh_token", tokenData.refresh_token);

    // Clean up the code verifier
    localStorage.removeItem("code_verifier");

    // Call your user API to verify/create user
    const apiResponse = await baseUserApi.auth.authVerifyUserCreate({});
    userStore.getState().setUser({
      id: apiResponse.data.id ?? "",
      email: userData.email,
      name: userData.name,
      photoURL: userData.picture,
    });

    // Redirect if navigate is provided
    if (navigate) navigate("/");

    return true;
  } catch (error) {
    console.error("Keycloak authentication error:", error);
    return false;
  }
};

export const signOut = () => {
  userStore.getState().clearUser();
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("code_verifier");
  window.location.href = "/signin";
};

import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { baseIdentityApi } from "../api";
import { userStore } from "../store/userStore";

const loginWithGoogle = async (
  navigate: (path: string) => void
): Promise<void> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      const userData = await baseIdentityApi.auth.authVerifyUserCreate({});
      userStore.getState().setUser({
        id: userData.data.id ?? "",
        email: user.email!,
        name: user.displayName || "",
        photoURL: user.photoURL || "",
      });
    }

    navigate("/"); // Redirect after login
  } catch (error) {
    console.error("Google Sign-in Error:", error);
  }
};

const loginWithEmail = async (
  email: string,
  password: string,
  navigate: (path: string) => void
): Promise<void> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User:", userCredential.user);
    navigate("/"); // Redirect after login
  } catch (error) {
    console.error("Email Sign-in Error:", error);
  }
};

const signOut = async (navigate: (path: string) => void): Promise<void> => {
  try {
    await auth.signOut();
    userStore.getState().clearUser();
    navigate("/"); // Redirect after login
  } catch (error) {
    console.error("Google Sign-in Error:", error);
  }
};
export { loginWithGoogle, loginWithEmail, signOut };

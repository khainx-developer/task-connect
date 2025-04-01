import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { baseIdentityApi } from "../api";
import { useUserStore } from "../store/userStore";

const loginWithGoogle = async (
  navigate: (path: string) => void
): Promise<void> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      const userData = await baseIdentityApi.auth.authVerifyUserCreate({});
      useUserStore.getState().setUser({
        id: userData.data.id ?? "",
        email: user.email!,
        name: user.displayName || "",
        photoURL: user.photoURL || "",
      });
    }

    navigate("/dashboard"); // Redirect after login
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
    navigate("/dashboard"); // Redirect after login
  } catch (error) {
    console.error("Email Sign-in Error:", error);
  }
};
export { loginWithGoogle, loginWithEmail };

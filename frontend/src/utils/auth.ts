import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

const loginWithGoogle = async (navigate: (path: string) => void): Promise<void> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("User:", result.user);
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

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Button } from "antd";

const Auth = () => {
    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            alert("Login successful!");
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return <Button type="primary" onClick={handleLogin}>Sign in with Google</Button>;
};

export default Auth;

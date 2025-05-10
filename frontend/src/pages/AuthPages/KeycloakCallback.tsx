import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleKeycloakCallback } from "../../utils/keycloakAuth";

export default function KeycloakCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get("code");
    if (code) {
      handleKeycloakCallback(code).then((success) => {
        if (success) {
          navigate("/");
        } else {
          navigate("/signin");
        }
      });
    } else {
      navigate("/signin");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Processing authentication...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
} 
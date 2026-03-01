import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const token = searchParams.get("token");
        if (token) {
          localStorage.setItem("token", token);
        }

        // Ensure auth token works correctly with cookies
        try {
          await api.post("/api/auth/refresh");
        } catch (err) {
          console.log("Cookie refresh ignored (fallback to localStorage)");
        }

        const res = await api.get("/api/auth/me", { skipAuthRefresh: true });

        if (res.data?.userId) {
          navigate("/", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch {
        navigate("/login", { replace: true });
      }
    };

    completeAuth();
  }, [navigate, searchParams]);

  return <h2>Logging you in...</h2>;
}
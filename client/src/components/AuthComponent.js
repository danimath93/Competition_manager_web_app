import React, {useEffect, useState} from "react";
import { useAuth } from "../context/AuthContext";

const AuthComponent = ({ requiredRoles, children }) => {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function verify() {
      if (loading) return;
      if (!user) {
        setAuthorized(false);
        return;
      }

      // Se serve, puoi anche verificare lato backend:
      // await checkAuth();

      if (requiredRoles && requiredRoles.length > 0 && requiredRoles.includes(user.permissions)) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    }

    verify();
  }, [user, loading, requiredRoles]);

  if (loading) return null;
  if (!authorized) return null;
  
  return <>{children}</>;
};

export default AuthComponent;
import { useEffect } from "react";
import { consumeLogoutReturnPath } from "../features/auth/cognitoAuth";

const SignoutCallback = () => {
  useEffect(() => {
    window.location.replace(consumeLogoutReturnPath());
  }, []);

  return <div>Signing you out...</div>;
};

export default SignoutCallback;

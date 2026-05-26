import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";

const RestrictedRoute = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();

  async function getUserInfo() {
    let loggedIn = await Session.doesSessionExist();
    if (loggedIn) {
      navigate("/");
    }
  }
  useEffect(() => {
    getUserInfo();
  }, []);
  return children;
};

export default RestrictedRoute;

import { Outlet } from "react-router-dom";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import UserInfoProvider from "./user-info-provider";

const ProtectedRouteProvider = () => {
  return (
    <SessionAuth>
      <UserInfoProvider>
        <Outlet />
      </UserInfoProvider>
    </SessionAuth>
  );
};

export default ProtectedRouteProvider;

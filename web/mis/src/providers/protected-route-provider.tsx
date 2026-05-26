import { Outlet } from "react-router-dom";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import UserInfoProvider from "./user-info-provider";
import { SSEContextProvider } from "./sse-provider";
import OrgContextProvider from "./organization-provider";

const ProtectedRouteProvider = () => {
  return (
    <SessionAuth>
      <UserInfoProvider>
        <OrgContextProvider>
          <SSEContextProvider>
            <Outlet />
          </SSEContextProvider>
        </OrgContextProvider>
      </UserInfoProvider>
    </SessionAuth>
  );
};

export default ProtectedRouteProvider;

import { getUserById } from "@/services/user.service";
import GettingSession from "@mono/shared_ui/components/layout/getting-session";
import { IUser } from "@mono/shared_ui/interfaces/user";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import Session from "supertokens-auth-react/recipe/session";
import { PermissionClaim } from "supertokens-web-js/recipe/userroles";

type Props = { user: IUser | null; loading: boolean };

type IUserInfoContext = Props & { permissions: Set<string> };
const UserInfoContext = createContext<IUserInfoContext>({} as any);

export const useUser = () => useContext(UserInfoContext);
const UserInfoProvider = ({ children }: PropsWithChildren) => {
  const [userInfo, setUserInfo] = useState<Props>({
    loading: true,
    user: null,
  });
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  async function getUserInfo() {
    if (await Session.doesSessionExist()) {
      let userId = await Session.getUserId();
      let roles = await Session.getClaimValue({ claim: PermissionClaim });

      try {
        const res = await getUserById(userId);
        if (!res.error) {
          setUserInfo({ user: res.data, loading: false });
          setPermissions(new Set(roles));
        }
      } catch (error) {
        toast.error(getAxiosErrorMessage(error));
        setUserInfo({ user: null, loading: false });
      }
    }
  }
  useEffect(() => {
    getUserInfo();
  }, []);
  return (
    <UserInfoContext.Provider value={{ ...userInfo, permissions }}>
      {userInfo.loading && !userInfo.user && (
        <GettingSession message="Getting User Info " />
      )}
      {!userInfo.loading && !userInfo.user && (
        <GettingSession message="Somethin went wrong." />
      )}
      {userInfo.user && children}
    </UserInfoContext.Provider>
  );
};

export default UserInfoProvider;

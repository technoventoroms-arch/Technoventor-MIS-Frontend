import { routeConstants } from "@/constants/route.constants";
import { getUserProfile } from "@/services/user.service";
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Session from "supertokens-auth-react/recipe/session";

type Props = { user: IUser | null; loading: boolean };

type IUserInfoContext = Props & {
  updateUserInfo: (data: IUser | null) => void;
};
const UserInfoContext = createContext<IUserInfoContext>({} as any);

export const useUser = () => useContext(UserInfoContext);
const UserInfoProvider = ({ children }: PropsWithChildren) => {
  const [userInfo, setUserInfo] = useState<Props>({
    loading: true,
    user: null,
  });
  const navigate = useNavigate();
  async function getUserInfo() {
    if (await Session.doesSessionExist()) {
      try {
        const res = await getUserProfile();
        if (!res.error) {
          setUserInfo({ user: res.data, loading: false });
          if (!res.data.is_verified) {
            navigate(`/${routeConstants.PROFILE}`, { state: { from: "/" } });
          }
        }
      } catch (error) {
        toast.error(getAxiosErrorMessage(error));
        setUserInfo({ user: null, loading: false });
        await Session.signOut();
        window.location.href = "/login";
      }
    }
  }
  useEffect(() => {
    getUserInfo();
  }, []);
  const updateUserInfo = async (data: IUser | null) => {
    setUserInfo({ ...userInfo, user: data });
  };

  return (
    <UserInfoContext.Provider value={{ ...userInfo, updateUserInfo }}>
      {userInfo.loading && !userInfo.user && (
        <GettingSession message="Getting User Info " />
      )}
      {!userInfo.loading && !userInfo.user && (
        <GettingSession message="Something went wrong." />
      )}
      {userInfo.user && children}
    </UserInfoContext.Provider>
  );
};

export default UserInfoProvider;

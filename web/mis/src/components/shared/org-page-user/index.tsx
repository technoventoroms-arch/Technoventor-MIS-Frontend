import { routeConstants } from "@/constants/route.constants";
import { useUser } from "@/providers/user-info-provider";
import { NavUser } from "@mono/shared_ui/components/shared/nav-user";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@mono/shared_ui/components/ui/dropdown-menu";
import { CreditCardIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";

const OrgPageUsers = () => {
  const { user } = useUser();

  const navigate = useNavigate();

  const logout = async () => {
    await Session.signOut();
    window.location.href = "/login";
  };

  const handleEditProfileClick = () => {
    navigate(`/${routeConstants.PROFILE}`);
  };
  return (
    <>
      <NavUser
        user={{
          avatar: user?.image_link || "",
          email: user?.email || "",
          name: user?.first_name || "",
        }}
        onLogoutClick={logout}
        trigger={
          <Button variant={"ghost"}>
            <Avatar className="h-8 w-8 rounded-lg ">
              <AvatarImage src={user?.image_link} alt={user?.first_name} />
              <AvatarFallback className="rounded-lg uppercase text-sm">
                {user?.first_name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      >
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleEditProfileClick}>
            <CreditCardIcon />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </NavUser>
    </>
  );
};

export default OrgPageUsers;

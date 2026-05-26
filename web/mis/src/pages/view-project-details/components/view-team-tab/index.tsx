import CanIUse from "@/components/shared/can-i-use";
import { IProjectMember } from "@/interfaces/projects";
import GenericCombobox from "@mono/shared_ui/components/shared/generic-combobox";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mono/shared_ui/components/ui/popover";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { IUser } from "@mono/shared_ui/interfaces/user";

import {
  DataWithLoading,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import {
  BadgeCheck,
  Check,
  ClockPlus,
  Info,
  PlusIcon,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const listSkeleton = (
  <>
    <li>
      <Skeleton className="w-full h-24 bg-neutral-200 dark:bg-accent " />
    </li>
    <li>
      <Skeleton className="w-full h-24 bg-neutral-200 dark:bg-accent " />
    </li>
    <li>
      <Skeleton className="w-full h-24 bg-neutral-200 dark:bg-accent " />
    </li>
    <li>
      <Skeleton className="w-full h-24 bg-neutral-200 dark:bg-accent " />
    </li>
  </>
);

type Props = {
  loading?: boolean;
  onAddMemberClick: (user: IProjectMember) => void;
  handleRemoveUser: (data: IProjectMember) => void;
  handleMakeOwner: (data: IProjectMember) => void;
  members: IProjectMember[];
  getUsersOnSearch: (data: string) => Promise<ResponseDataType<IUser[], null>>;
  canUpdateOwner: boolean;
};

const ViewTeamTab = ({
  loading,
  onAddMemberClick,
  members,
  handleMakeOwner,
  handleRemoveUser,
  getUsersOnSearch,
  canUpdateOwner,
}: Props) => {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [users, setUsers] = useState<DataWithLoading<IProjectMember[]>>({
    data: [],
    loading: false,
  });
  const handleSearch = async (search: string) => {
    if (!search) return;
    setUsers({ data: [], loading: true });
    try {
      const res = await getUsersOnSearch(search);
      if (!res.error) {
        setUsers({ data: (res.data || []) as any, loading: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setUsers({ data: [], loading: false });
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        Members{" "}
        {canUpdateOwner && (
          <CanIUse action={(a) => a.UPDATE_PROJECTS}>
            <Popover
              open={addMemberOpen}
              onOpenChange={(o) => setAddMemberOpen(o)}
            >
              <PopoverTrigger asChild>
                <Button
                  className="mr-2"
                  variant="indigo"
                  size="sm"
                  title="Add member"
                  rounded={"sm"}
                  onClick={() => setAddMemberOpen(true)}
                >
                  <PlusIcon />
                  <span className="inline">Add Member</span>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-1 w-60">
                <GenericCombobox
                  loading={false}
                  options={users.data}
                  getItemLabel={(e) => `${e.first_name} ${e.last_name}`}
                  getItemValue={(e) => `${e.user_id}`}
                  emptyText={"No users found."}
                  onDebouncedChange={handleSearch}
                  onChange={onAddMemberClick}
                  closeOnSelect={() => setAddMemberOpen(false)}
                  renderOptions={({ getItemValue, item, value }) => (
                    <>
                      <div className="flex gap-2 items-center w-max">
                        <Avatar className="size-12 rounded-full">
                          <AvatarImage
                            src={(item as any)?.image_link}
                            alt={item?.first_name}
                          />
                          <AvatarFallback className="rounded-lg uppercase">
                            {item?.first_name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate text-sm font-medium">
                            {item?.first_name}
                          </span>
                          <span className="truncate text-sm text-muted-foreground">
                            {item?.email}
                          </span>
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto",
                          value && getItemValue(value) === getItemValue(item)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </>
                  )}
                />
              </PopoverContent>
            </Popover>
          </CanIUse>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {loading ? (
          listSkeleton
        ) : !loading && !members.length ? (
          <div className="text-rose-700 bg-rose-500/15 p-4 my-4 rounded flex items-center gap-2">
            <Info /> Please add memebers to project.
          </div>
        ) : (
          members.map((i) => (
            <MemberCard
              member={i}
              removeUser={handleRemoveUser}
              makeOwner={handleMakeOwner}
              canUpdateOwner={canUpdateOwner}
            />
          ))
        )}
      </ul>
    </div>
  );
};

export default ViewTeamTab;

type MemberCardProp = {
  member: IProjectMember;
  removeUser: (data: IProjectMember) => void;
  makeOwner: (data: IProjectMember) => void;
  canUpdateOwner: boolean;
};
const MemberCard = ({
  member,
  removeUser,
  makeOwner,
  canUpdateOwner,
}: MemberCardProp) => {
  return (
    <li className="bg-card text-card-foreground rounded-xs border p-4 shadow-sm flex justify-between items-center flex-wrap gap-2">
      <div className="flex gap-2 items-center w-max">
        <Avatar className="size-12 rounded-full">
          <AvatarImage
            src={(member as any)?.image_link}
            alt={member?.first_name}
          />
          <AvatarFallback className="rounded-lg uppercase">
            {member?.first_name?.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate text-sm font-medium">
            {member?.first_name}
          </span>
          <span className="truncate text-sm text-muted-foreground">
            {member?.email}
          </span>
        </div>
      </div>
      <div className="">
        <Badge variant={"yellow"} className="capitalize">
          {member.role_name.toLowerCase()}
        </Badge>{" "}
      </div>
      <div className="flex gap-2 items-center">
        <div className="text-xs mb-1">Added On</div>
        <Badge variant={"green"} className="text-xs">
          <ClockPlus className="mr-1" />
          {format(new Date(), "PPP")}
        </Badge>
      </div>
      <div className=" flex gap-2 justify-start md:justify-end items-center">
        {canUpdateOwner && (
          <CanIUse action={(a) => a.UPDATE_PROJECTS}>
            <Button
              onClick={() => makeOwner(member)}
              title="Promote to owner"
              variant={"purple"}
              rounded={"md"}
            >
              <BadgeCheck />
            </Button>
            <Button
              onClick={() => removeUser(member)}
              title="Remove user from project"
              variant={"red"}
              rounded={"md"}
            >
              <Trash />
            </Button>
          </CanIUse>
        )}
      </div>
    </li>
  );
};

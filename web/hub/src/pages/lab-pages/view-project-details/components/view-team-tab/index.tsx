import { IProjectMember } from "@/interfaces/projects";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";

import { format } from "date-fns";
import { ClockPlus, Info } from "lucide-react";

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
  members: IProjectMember[];
};

const ViewTeamTab = ({ loading, members }: Props) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">Members </div>
      <ul className="flex flex-col gap-2">
        {loading ? (
          listSkeleton
        ) : !loading && !members.length ? (
          <div className="text-rose-700 bg-rose-500/15 p-4 my-4 rounded flex items-center gap-2">
            <Info /> Please add memebers to project.
          </div>
        ) : (
          members.map((i) => <MemberCard member={i} />)
        )}
      </ul>
    </div>
  );
};

export default ViewTeamTab;

type MemberCardProp = {
  member: IProjectMember;
};
const MemberCard = ({ member }: MemberCardProp) => {
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
        <Badge variant={"yellow"}>Manger</Badge>{" "}
      </div>
      <div className="flex gap-2 items-center">
        <div className="text-xs mb-1">Added On</div>
        <Badge variant={"green"} className="text-xs">
          <ClockPlus className="mr-1" />
          {format(new Date(), "PPP")}
        </Badge>
      </div>
    </li>
  );
};

import { assignLabToUser, getUnassignedLabs } from "@/services/user.service";
import GenericCombobox from "@mono/shared_ui/components/shared/generic-combobox";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mono/shared_ui/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mono/shared_ui/components/ui/select";
import { roleId } from "@mono/shared_ui/constants/role-mapping";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { IUserLab } from "@mono/shared_ui/interfaces/labs";
import { OrgUser } from "@mono/shared_ui/interfaces/user";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { ChevronsUpDown, Loader, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
type Props = {
  user: OrgUser;
  orgId: number;
  handleOnSubmit: () => void;
};

const AssignLabs = ({ user, orgId, handleOnSubmit }: Props) => {
  const { hideLoading, loading, showLoading } = useLoading();
  const [open, setOpen] = useState(false);
  const [labs, setLabs] = useState<DataWithLoading<IUserLab[]>>({
    data: [],
    loading: false,
  });
  const [selectedLab, setSelectedLab] = useState<IUserLab | null>(null);
  const [selectedRole, setSelectdRole] = useState(roleId.ADMIN);
  const handleAssignLab = async () => {
    try {
      showLoading();
      const res = await assignLabToUser({
        labId: selectedLab!.lab_id,
        orgId,
        userId: user.identity_provider_id,
        roleId: selectedRole,
      });
      if (!res.error) {
        toast.success("Lab assigned to user successfully.");
        handleOnSubmit();
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  const searchLabs = async () => {
    setLabs({ data: [], loading: true });
    try {
      const res = await getUnassignedLabs({
        orgId,
        userId: user.identity_provider_id,
      });
      setLabs({
        data: !res.error ? (res.data as any) || [] : [],
        loading: false,
      });
    } catch (e) {
      setLabs({ data: [], loading: false });
      toast.error("Unable to search labs");
    }
  };
  useEffect(() => {
    searchLabs();
  }, []);
  return (
    <div className="overflow-auto p-2">
      <div>
        Select a Lab to assign to user
        <div className="flex gap-2 mt-2">
          <Avatar className="h-8 w-8 rounded-lg ">
            <AvatarImage src={user?.image_link} alt={user?.first_name} />
            <AvatarFallback className="rounded-lg uppercase">
              {user?.first_name?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>
        <div className="col-span-6 mt-4">
          <Popover open={open} onOpenChange={setOpen}>
            <div
              className={cn(
                "w-full text-left font-normal flex items-center",
                !selectedLab && "text-muted-foreground"
              )}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("w-auto flex-1 flex justify-between")}
                >
                  {selectedLab?.name || "Select lab"}
                  <ChevronsUpDown className="opacity-50 justify-self-end" />
                </Button>
              </PopoverTrigger>
              {selectedLab?.name && (
                <Button
                  type="button"
                  variant={"outline"}
                  className="ml-2"
                  onClick={() => setSelectedLab(null)}
                >
                  <X />
                </Button>
              )}
            </div>
            <PopoverContent className="w-auto p-0">
              <GenericCombobox
                emptyText="Search for labs"
                placeholder="Search for lab"
                loading={labs.loading}
                options={labs.data}
                getItemLabel={(e) => e.name}
                getItemValue={(e) => `${e.lab_id}`}
                value={selectedLab}
                onChange={(e) => {
                  setSelectedLab(e);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="my-4">
          <span>Select Role</span>
          <Select
            onValueChange={(val) => {
              if (val) {
                setSelectdRole(Number.parseInt(val));
              }
            }}
            value={selectedRole.toString()}
          >
            <SelectTrigger className="h-8 w-full mt-2" size="sm">
              <SelectValue className={cn("capitalize")} />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: roleId.ADMIN, label: "Admin" },
                { value: roleId.MANAGER, label: "Manager" },
                { value: roleId.USER, label: "User" },
              ].map((i) => (
                <SelectItem className="capitalize" value={i.value.toString()}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full"
          variant={"green"}
          disabled={loading || !searchLabs || !selectedRole}
          onClick={handleAssignLab}
        >
          {loading ? <Loader className="animate-spin" /> : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default AssignLabs;

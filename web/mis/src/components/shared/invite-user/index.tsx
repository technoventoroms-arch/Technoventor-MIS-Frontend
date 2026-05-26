import { ILabType } from "@/interfaces/labs";
import GenericCombobox from "@mono/shared_ui/components/shared/generic-combobox";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Input } from "@mono/shared_ui/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mono/shared_ui/components/ui/popover";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mono/shared_ui/components/ui/select";
import { roleId } from "@mono/shared_ui/constants/role-mapping";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { cn } from "@mono/shared_ui/lib/utils";
import { ChevronsUpDown, Loader, X } from "lucide-react";
import { useState } from "react";
import z from "zod";

export type InviteUserMailRoleMap = { mail: string; role: number };
export type InviteUserFormData = {
  lab: ILabType;
  users: InviteUserMailRoleMap[];
};
export type InviteUserProps = {
  handleSubmit: (data: InviteUserFormData) => void;
  handleClose: () => void;
  loading?: boolean;
  orgId: number;
  labs: DataWithLoading<ILabType[]>;
  showLabSelect?: boolean;
};
const EmailSchema = z.object({
  email: z.string().email("Invalid email."),
});
const InviteUser = ({
  handleSubmit,
  handleClose,
  loading,
  labs,
  showLabSelect = true,
}: InviteUserProps) => {
  const [open, setOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<ILabType | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [mails, setMails] = useState<InviteUserMailRoleMap[]>([]);
  const removeItem = (idx: number) => {
    setMails(mails.filter((_, i) => i != idx));
  };
  const handleRoleChange = (idx: number) => (role: number) => {
    const temp = [...mails];
    temp[idx].role = role;
    setMails(temp);
  };

  const validateAndUpdateEmail = (e: string) => {
    const isValidEmail = EmailSchema.safeParse({ email: e });
    if (!isValidEmail.success) {
      setEmailError(isValidEmail.error.formErrors.fieldErrors.email?.[0] || "");
      return true;
    } else {
      setEmailError("");
    }
  };
  const handleInviteUser = () => {
    handleSubmit({
      lab: selectedLab!,
      users: mails,
    });
  };
  return (
    <div className="px-4">
      {showLabSelect && (
        <div className="col-span-6 mb-2">
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
      )}
      <div className="flex gap-2 flex-col md:flex-row">
        <Input
          value={input}
          onChange={(e) => {
            if (emailError) validateAndUpdateEmail(e.target.value);
            setInput(e.target.value);
          }}
          type="email"
        />
        <Button
          disabled={!!emailError}
          onClick={() => {
            const notValid = validateAndUpdateEmail(input);
            if (mails.find((i) => i.mail === input.trim())) {
              setEmailError("Email already added to invite list.");
              return;
            }
            if (notValid) return;
            setMails([{ mail: input.trim(), role: roleId.USER }, ...mails]);
            setInput("");
          }}
        >
          Add
        </Button>
      </div>
      {emailError && (
        <span className="text-sm text-destructive">{emailError}</span>
      )}
      <ScrollArea className="max-h-full h-72 w-full border rounded my-2">
        <div className="p-4 flex flex-col gap-2">
          {mails.length ? (
            <>
              {mails.map((m, idx) => (
                <NewUserCard
                  changeRole={handleRoleChange(idx)}
                  removeUser={() => removeItem(idx)}
                  email={m.mail}
                  role={m.role}
                />
              ))}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              Please Add Email
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex gap-2 mb-2">
        <Button
          disabled={loading}
          onClick={handleClose}
          variant={"gray"}
          className="ml-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={handleInviteUser}
          variant={"green"}
          disabled={
            loading || !(selectedLab || !showLabSelect) || !mails.length
          }
        >
          {loading ? <Loader className="animate-spin" /> : "Invite"}
        </Button>
      </div>
    </div>
  );
};

export default InviteUser;

type NewUserCard = {
  email: string;
  role: number;
  changeRole: (val: number) => void;
  removeUser: () => void;
};
const NewUserCard = ({ email, role, changeRole, removeUser }: NewUserCard) => {
  return (
    <div className="flex gap-2 justify-between">
      <div className="flex-1">{email}</div>
      <Select
        onValueChange={(val) => {
          if (val) {
            changeRole(Number.parseInt(val));
          }
        }}
        value={role?.toString()}
      >
        <SelectTrigger className="h-8" size="sm">
          <SelectValue className={cn("capitalize")} />
        </SelectTrigger>
        <SelectContent>
          {[
            { value: roleId.MANAGER, label: "Manager" },
            { value: roleId.USER, label: "User" },
          ].map((i) => (
            <SelectItem className="capitalize" value={i.value.toString()}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size={"sm"} variant={"destructive"} onClick={removeUser}>
        <X />
      </Button>
    </div>
  );
};

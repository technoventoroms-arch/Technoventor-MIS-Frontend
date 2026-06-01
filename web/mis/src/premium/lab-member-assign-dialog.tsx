import { useEffect, useMemo, useState } from "react";

import { apiClient, normalizeApiError, type Entity } from "@mono/api_client";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { Label } from "@mono/shared_ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mono/shared_ui/components/ui/select";
import { Switch } from "@mono/shared_ui/components/ui/switch";
import { Loader2 } from "lucide-react";

import {
  entityLabel,
  inventoryAccessHelperText,
  isLabManagerRoleId,
} from "./lab-manager-access";

export function LabMemberAssignDialog({
  open,
  onOpenChange,
  orgId,
  labName,
  orgMembers,
  roles,
  createPath,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string | number;
  labName?: string;
  orgMembers: Entity[];
  roles: Entity[];
  createPath: string;
  onSaved: () => Promise<void>;
}) {
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [canManageInventory, setCanManageInventory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userOptions = useMemo(
    () =>
      orgMembers.map((row) => ({
        value: String((row.user as Entity | undefined)?.id ?? row.id),
        label: entityLabel(row.user as Entity | undefined ?? row),
      })),
    [orgMembers]
  );
  const roleOptions = useMemo(
    () => roles.map((row) => ({ value: String(row.id), label: entityLabel(row) })),
    [roles]
  );

  const showInventoryToggle = isLabManagerRoleId(roleId, roles);

  useEffect(() => {
    if (!open) return;
    setUserId("");
    setRoleId("");
    setCanManageInventory(false);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!showInventoryToggle) setCanManageInventory(false);
  }, [showInventoryToggle]);

  const submitDisabled = isSubmitting || !userId || !roleId;

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.create(
        createPath,
        {
          user_id: Number(userId),
          role_id: Number(roleId),
          can_manage_inventory: showInventoryToggle && canManageInventory,
        },
        { orgId }
      );
      onOpenChange(false);
      await onSaved();
    } catch (submitError) {
      const apiError = normalizeApiError(submitError);
      const fieldMsg =
        apiError.fields?.can_manage_inventory?.[0] ??
        apiError.fields?.role_id?.[0] ??
        apiError.fields?.user_id?.[0];
      setError(fieldMsg ?? apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign member</DialogTitle>
          <DialogDescription>Add an organisation user to this lab with a role.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Organisation user</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {userOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showInventoryToggle ? (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <div className="space-y-1">
                <Label htmlFor="member-inventory">Allow inventory management</Label>
                <p className="text-xs text-slate-500">{inventoryAccessHelperText(labName)}</p>
              </div>
              <Switch
                id="member-inventory"
                checked={canManageInventory}
                onCheckedChange={setCanManageInventory}
              />
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button disabled={submitDisabled} onClick={() => void handleSubmit()}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Assign member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

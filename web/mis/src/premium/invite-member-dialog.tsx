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
import { Input } from "@mono/shared_ui/components/ui/input";
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

type FieldOption = { label: string; value: string };

export function InviteMemberDialog({
  open,
  onOpenChange,
  orgId,
  labs,
  roles,
  createPath,
  updatePath,
  initialInvite,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string | number;
  labs: Entity[];
  roles: Entity[];
  createPath: string;
  updatePath?: string;
  initialInvite?: Entity | null;
  onSaved: () => Promise<void>;
}) {
  const isEdit = Boolean(initialInvite?.id);
  const [email, setEmail] = useState("");
  const [lab, setLab] = useState("");
  const [role, setRole] = useState("");
  const [canManageInventory, setCanManageInventory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labOptions: FieldOption[] = useMemo(
    () => labs.map((row) => ({ value: String(row.id), label: entityLabel(row) })),
    [labs]
  );
  const roleOptions: FieldOption[] = useMemo(
    () => roles.map((row) => ({ value: String(row.id), label: entityLabel(row) })),
    [roles]
  );

  const showInventoryToggle = isLabManagerRoleId(role, roles);
  const selectedLabName = labOptions.find((option) => option.value === lab)?.label;

  useEffect(() => {
    if (!open) return;
    if (initialInvite) {
      setEmail(String(initialInvite.email ?? ""));
      setLab(initialInvite.lab != null ? String(initialInvite.lab) : "");
      setRole(initialInvite.role != null ? String(initialInvite.role) : "");
      setCanManageInventory(Boolean(initialInvite.can_manage_inventory));
    } else {
      setEmail("");
      setLab("");
      setRole("");
      setCanManageInventory(false);
    }
    setError(null);
  }, [open, initialInvite]);

  useEffect(() => {
    if (!showInventoryToggle) {
      setCanManageInventory(false);
    }
  }, [showInventoryToggle]);

  const submitDisabled =
    isSubmitting ||
    (!isEdit && !email.trim()) ||
    !lab ||
    !role ||
    (canManageInventory && !lab);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        ...(isEdit ? {} : { email: email.trim() }),
        lab: Number(lab),
        role: Number(role),
        can_manage_inventory: showInventoryToggle && canManageInventory,
      };
      if (isEdit && updatePath) {
        await apiClient.update(updatePath, payload, { orgId });
      } else {
        await apiClient.create(createPath, payload, { orgId });
      }
      onOpenChange(false);
      await onSaved();
    } catch (submitError) {
      const apiError = normalizeApiError(submitError);
      const fieldMsg =
        apiError.fields?.can_manage_inventory?.[0] ??
        apiError.fields?.lab?.[0] ??
        apiError.fields?.role?.[0] ??
        apiError.fields?.email?.[0];
      setError(fieldMsg ?? apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit invitation" : "Invite member"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update lab, role, or inventory access for this pending invite."
              : "Send a lab-aware invitation with an assigned role."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!isEdit ? (
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="manager@example.com"
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Lab</Label>
            <Select value={lab} onValueChange={setLab} required>
              <SelectTrigger>
                <SelectValue placeholder="Select lab" />
              </SelectTrigger>
              <SelectContent>
                {labOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole} required>
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
                <Label htmlFor="invite-inventory">Allow inventory management</Label>
                <p className="text-xs text-slate-500">{inventoryAccessHelperText(selectedLabName)}</p>
              </div>
              <Switch
                id="invite-inventory"
                checked={canManageInventory}
                onCheckedChange={setCanManageInventory}
              />
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
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
            {isEdit ? "Save changes" : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Edit, Loader2, MoreHorizontal, Plus, Trash2 } from "lucide-react";

import { apiClient, normalizeApiError, type ApiError, type Entity } from "@mono/api_client";
import { ImageUploadField } from "@mono/shared_ui/components/shared/image-upload-field";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@mono/shared_ui/components/ui/dropdown-menu";
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
import { Textarea } from "@mono/shared_ui/components/ui/textarea";
import {
  PremiumDataTable,
  type PremiumColumn,
} from "@mono/shared_ui/components/premium";

export type FieldOption = {
  label: string;
  value: string;
};

export type ResourceField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "datetime-local" | "textarea" | "select" | "image";
  required?: boolean;
  placeholder?: string;
  helper?: string;
  defaultValue?: string;
  options?: FieldOption[];
  uploadFolder?: string;
  onValueChange?: (value: string, values: Record<string, string>) => Record<string, string>;
};

export type ResourceAction<T extends Entity> = {
  label: string;
  tone?: "default" | "outline" | "destructive" | "secondary";
  run: (row: T) => Promise<void>;
};

export type ResourceRowMenuItem<T extends Entity> = {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: (row: T) => void;
  disabled?: boolean | ((row: T) => boolean);
  title?: string;
  destructive?: boolean;
  hidden?: boolean | ((row: T) => boolean);
  separatorBefore?: boolean;
};

export function ResourceCrudTable<T extends Entity>({
  title,
  description,
  resource,
  fields,
  createPath,
  updatePath,
  deletePath,
  orgId,
  createLabel = "Create record",
  columns,
  rowActions = [],
  rowMenuItems,
  actionStyle = "buttons",
  transformPayload,
}: {
  title: string;
  description?: string;
  resource: {
    rows: T[];
    next: string | null;
    previous: string | null;
    error: ApiError | null;
    isLoading: boolean;
    lastUpdatedAt?: number | null;
    reload: () => Promise<void>;
    loadNext: () => Promise<void>;
    loadPrevious: () => Promise<void>;
  };
  fields: ResourceField[];
  createPath?: string | null;
  updatePath?: (row: T) => string;
  deletePath?: (row: T) => string;
  orgId?: string | number;
  createLabel?: string;
  columns: PremiumColumn<T>[];
  rowActions?: ResourceAction<T>[];
  rowMenuItems?: (row: T) => ResourceRowMenuItem<T>[];
  actionStyle?: "buttons" | "menu";
  transformPayload?: (values: Record<string, string>) => Record<string, unknown>;
}) {
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const resolvePayload = useMemo(
    () => transformPayload ?? ((values: Record<string, string>) => buildResourcePayload(values, fields)),
    [fields, transformPayload]
  );

  async function runRowAction(action: ResourceAction<T>, row: T) {
    setActionError(null);
    setRunningAction(`${action.label}-${row.id}`);
    try {
      await action.run(row);
      await resource.reload();
    } catch (error) {
      setActionError(normalizeApiError(error).message);
    } finally {
      setRunningAction(null);
    }
  }

  async function removeRow(row: T) {
    if (!deletePath) return;
    setActionError(null);
    setRunningAction(`delete-${row.id}`);
    try {
      await apiClient.remove(deletePath(row), { orgId });
      await resource.reload();
    } catch (error) {
      setActionError(normalizeApiError(error).message);
    } finally {
      setRunningAction(null);
    }
  }

  const actionColumn = useMemo<PremiumColumn<T>>(
    () => ({
      key: "actions",
      header: actionStyle === "menu" ? "" : "Actions",
      className: "w-12 text-right",
      render: (row) =>
        actionStyle === "menu" ? (
          <RowActionsMenu
            row={row}
            rowActions={rowActions}
            rowMenuItems={rowMenuItems?.(row) ?? []}
            runningAction={runningAction}
            onRunRowAction={runRowAction}
            onEdit={updatePath ? () => setEditingRow(row) : undefined}
            onDelete={deletePath ? () => void removeRow(row) : undefined}
          />
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            {rowActions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant={action.tone ?? "outline"}
                disabled={runningAction === `${action.label}-${row.id}`}
                onClick={() => void runRowAction(action, row)}
              >
                {action.label}
              </Button>
            ))}
            {updatePath ? (
              <Button size="sm" variant="outline" onClick={() => setEditingRow(row)}>
                <Edit className="size-3.5" />
                Edit
              </Button>
            ) : null}
            {deletePath ? (
              <Button size="sm" variant="destructive" onClick={() => void removeRow(row)}>
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            ) : null}
          </div>
        ),
    }),
    [actionStyle, deletePath, rowActions, rowMenuItems, runningAction, updatePath]
  );

  return (
    <>
      <PremiumDataTable
        title={title}
        description={
          actionError ??
          resource.error?.message ??
          description ??
          (resource.isLoading
            ? "Refreshing records..."
            : `Live workspace records${resource.lastUpdatedAt ? ` • Updated ${formatRelativeTime(resource.lastUpdatedAt)}` : ""}.`)
        }
        columns={[...columns, actionColumn]}
        rows={resource.rows}
        getRowKey={(row, index) => `${row.id}-${index}`}
        next={resource.next}
        previous={resource.previous}
        onNext={resource.loadNext}
        onPrevious={resource.loadPrevious}
        actions={
          createPath ? (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4" />
              {createLabel}
            </Button>
          ) : null
        }
        emptyTitle={`No ${title.toLowerCase()} yet`}
        emptyDescription="Create the first record to activate this operational surface."
      />
      {createPath ? (
        <ResourceFormDialog
          title={createLabel}
          description={`Create a new ${title.toLowerCase()} record.`}
          fields={fields}
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={async (values) => {
            await apiClient.create(createPath, resolvePayload(values), { orgId });
            await resource.reload();
          }}
        />
      ) : null}
      {editingRow && updatePath ? (
        <ResourceFormDialog
          title={`Edit ${title}`}
          description="Update this record and save your changes."
          fields={fields}
          initialValues={editingRow}
          open={Boolean(editingRow)}
          onOpenChange={(open) => {
            if (!open) setEditingRow(null);
          }}
          onSubmit={async (values) => {
            await apiClient.update(updatePath(editingRow), resolvePayload(values), { orgId });
            setEditingRow(null);
            await resource.reload();
          }}
        />
      ) : null}
    </>
  );
}

function formatRelativeTime(timestamp: number): string {
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (deltaSeconds < 5) return "just now";
  if (deltaSeconds < 60) return `${deltaSeconds}s ago`;
  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  return `${deltaHours}h ago`;
}

function RowActionsMenu<T extends Entity>({
  row,
  rowActions,
  rowMenuItems,
  runningAction,
  onRunRowAction,
  onEdit,
  onDelete,
}: {
  row: T;
  rowActions: ResourceAction<T>[];
  rowMenuItems: ResourceRowMenuItem<T>[];
  runningAction: string | null;
  onRunRowAction: (action: ResourceAction<T>, row: T) => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const visibleMenuItems = rowMenuItems.filter((item) => {
    if (typeof item.hidden === "function") return !item.hidden(row);
    return !item.hidden;
  });
  const hasCrud = Boolean(onEdit || onDelete);
  const hasAsyncActions = rowActions.length > 0;
  const showManageSeparator = visibleMenuItems.length > 0 && (hasCrud || hasAsyncActions);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="size-8" aria-label="Open actions menu">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {visibleMenuItems.map((item) => {
            const disabled = typeof item.disabled === "function" ? item.disabled(row) : item.disabled;
            const content = (
              <>
                {item.icon}
                {item.label}
              </>
            );

            if (item.href) {
              return (
                <span key={item.label}>
                  {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem asChild disabled={disabled} title={item.title} variant={item.destructive ? "destructive" : "default"}>
                    <Link to={item.href}>{content}</Link>
                  </DropdownMenuItem>
                </span>
              );
            }

            return (
              <span key={item.label}>
                {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  disabled={disabled}
                  title={item.title}
                  variant={item.destructive ? "destructive" : "default"}
                  onClick={() => item.onClick?.(row)}
                >
                  {content}
                </DropdownMenuItem>
              </span>
            );
          })}
          {rowActions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              disabled={runningAction === `${action.label}-${row.id}`}
              onClick={() => void onRunRowAction(action, row)}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
          {showManageSeparator ? <DropdownMenuSeparator /> : null}
          {onEdit ? (
            <DropdownMenuItem onClick={onEdit}>
              <Edit />
              Edit
            </DropdownMenuItem>
          ) : null}
          {onDelete ? (
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ResourceFormDialog({
  title,
  description,
  fields,
  initialValues,
  open,
  onOpenChange,
  onSubmit,
}: {
  title: string;
  description?: string;
  fields: ResourceField[];
  initialValues?: Entity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <ResourceForm
          fields={fields}
          initialValues={initialValues}
          submitLabel={title}
          onSubmit={async (values) => {
            await onSubmit(values);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ResourceForm({
  fields,
  initialValues,
  submitLabel,
  onSubmit,
}: {
  fields: ResourceField[];
  initialValues?: Entity | null;
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextValues: Record<string, string> = {};
    for (const field of fields) {
      const source = initialValues?.[field.name];
      if (source !== null && typeof source === "object") {
        nextValues[field.name] = JSON.stringify(source, null, 2);
      } else {
        nextValues[field.name] =
          source === null || source === undefined ? field.defaultValue ?? "" : String(source);
      }
    }
    setValues(nextValues);
  }, [fields, initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (submitError) {
      setError(normalizeApiError(submitError).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name] ?? ""}
            onChange={(value) =>
              setValues((current) => {
                const nextValues = { ...current, [field.name]: value };
                return { ...nextValues, ...(field.onValueChange?.(value, nextValues) ?? {}) };
              })
            }
          />
        ))}
      </div>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FormField({
  field,
  value,
  onChange,
}: {
  field: ResourceField;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `field-${field.name}`;
  const sharedProps = {
    id,
    name: field.name,
    required: field.required,
    placeholder: field.placeholder,
  };

  return (
    <div className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"}>
      <Label htmlFor={id}>{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea {...sharedProps} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : field.type === "image" ? (
        <ImageUploadField
          id={id}
          name={field.name}
          value={value}
          required={field.required}
          placeholder={field.placeholder}
          helper={field.helper}
          folder={field.uploadFolder ?? inferImageFolder(field.name)}
          authenticator={() => apiClient.getImageKitAuth()}
          onChange={onChange}
        />
      ) : field.type === "select" ? (
        <Select value={value} onValueChange={onChange} required={field.required}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          {...sharedProps}
          type={field.type ?? "text"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.helper ? <p className="text-xs text-slate-500">{field.helper}</p> : null}
    </div>
  );
}

function inferImageFolder(fieldName: string): string {
  if (fieldName === "logo_url") {
    return "/org-logos";
  }
  if (fieldName === "image_url") {
    return "/images";
  }
  return "/uploads";
}

export function buildResourcePayload(
  values: Record<string, string>,
  fields: ResourceField[]
): Record<string, unknown> {
  const imageFields = new Set(fields.filter((field) => field.type === "image").map((field) => field.name));
  const jsonObjectFields = new Set(
    fields.filter((field) => field.type === "textarea" && field.name === "address").map((field) => field.name)
  );
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "") {
      if (imageFields.has(key)) {
        result[key] = null;
      }
      continue;
    }
    if (jsonObjectFields.has(key)) {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
      continue;
    }
    result[key] = value;
  }
  return result;
}

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";

import { apiClient, normalizeApiError, type ApiError, type Entity } from "@mono/api_client";
import { ImageUploadField } from "@mono/shared_ui/components/shared/image-upload-field";
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
      header: "Actions",
      className: "text-right",
      render: (row) => (
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
    [deletePath, rowActions, runningAction, updatePath]
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

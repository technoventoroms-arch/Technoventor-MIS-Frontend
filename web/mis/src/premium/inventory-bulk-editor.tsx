import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";

import { apiClient, endpoints, normalizeApiError, type Entity } from "@mono/api_client";
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
import { Textarea } from "@mono/shared_ui/components/ui/textarea";
import { PremiumSurface } from "@mono/shared_ui/components/premium";
import { toast } from "sonner";

import { bulkItemsToCsv, csvRowsToBulkItems, inventoryCsvTemplate } from "./inventory-csv-tools";

type BulkResultRow = {
  row: number;
  success: boolean;
  id?: number;
  errors?: string[];
};

type BulkResponse = {
  error?: boolean;
  message?: string;
  data?: {
    created?: number;
    updated?: number;
    deleted?: number;
    results?: BulkResultRow[];
  };
};

export function InventoryBulkTools({
  labId,
  orgId,
  selectedItems,
  onComplete,
}: {
  labId: string;
  orgId?: string;
  selectedItems: Entity[];
  onComplete: () => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

  async function runBulk(action: "create" | "update" | "delete", body: Record<string, unknown>) {
    setIsSubmitting(true);
    try {
      const response = await apiClient.create<BulkResponse>(
        endpoints.inventory.itemsBulk(labId),
        body,
        { orgId }
      );
      const results = response.data?.results ?? [];
      const failed = results.filter((r) => !r.success);
      if (failed.length) {
        toast.error(
          failed
            .slice(0, 3)
            .map((r) => `Row ${r.row + 1}: ${(r.errors ?? []).join(" ")}`)
            .join("\n")
        );
      } else {
        toast.success(response.message ?? "Bulk operation completed.");
      }
      await onComplete();
      return response;
    } catch (error) {
      toast.error(normalizeApiError(error).message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function importCsv() {
    const { rows, errors } = csvRowsToBulkItems(csvText);
    if (errors.length) {
      toast.error(errors.slice(0, 5).join("\n"));
      return;
    }
    if (!rows.length) {
      toast.error("No data rows found in CSV.");
      return;
    }
    await runBulk("create", {
      action: "create",
      items: rows.map((row) => ({
        name: row.name,
        sku: row.sku,
        type: row.type,
        unit_symbol: row.unit_symbol,
        category: row.category || undefined,
        quantity: row.quantity,
        threshold: row.threshold,
        description: row.description,
        image_url: row.image_url,
        is_active: row.is_active !== "false",
      })),
    });
    setIsImportOpen(false);
    setCsvText("");
  }

  async function deleteSelected() {
    if (!selectedItems.length) {
      toast.error("Select items in the table first.");
      return;
    }
    if (!window.confirm(`Delete ${selectedItems.length} inventory item(s)?`)) return;
    await runBulk("delete", {
      action: "delete",
      ids: selectedItems.map((item) => Number(item.id)),
    });
  }

  function downloadTemplate() {
    const blob = new Blob([inventoryCsvTemplate()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "inventory-import-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportSelected() {
    const csv = bulkItemsToCsv(
      selectedItems.length
        ? selectedItems
        : []
    );
    if (!selectedItems.length) {
      toast.error("Select items to export, or use template for new imports.");
      return;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "inventory-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PremiumSurface className="flex flex-wrap items-center gap-2 p-4">
      <Button size="sm" variant="outline" onClick={() => setIsImportOpen(true)} disabled={isSubmitting}>
        <Upload className="size-4" />
        Import CSV
      </Button>
      <Button size="sm" variant="outline" onClick={downloadTemplate} disabled={isSubmitting}>
        <Download className="size-4" />
        Template
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={exportSelected}
        disabled={isSubmitting || !selectedItems.length}
      >
        <Download className="size-4" />
        Export selected
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={deleteSelected}
        disabled={isSubmitting || !selectedItems.length}
      >
        Delete selected
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsBulkEditOpen(true)}
        disabled={isSubmitting || !selectedItems.length}
      >
        Bulk edit selected
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          setCsvText(text);
          setIsImportOpen(true);
          event.target.value = "";
        }}
      />
      <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={isSubmitting}>
        Choose file
      </Button>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import inventory CSV</DialogTitle>
            <DialogDescription>
              Columns: name, sku, type, unit_symbol (use Nos for count items), category_id, quantity,
              threshold, description, image_url, is_active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="inventory-csv">CSV content</Label>
            <Textarea
              id="inventory-csv"
              rows={12}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={inventoryCsvTemplate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={importCsv}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Importing…
                </>
              ) : (
                "Import rows"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InventoryBulkEditDialog
        labId={labId}
        orgId={orgId}
        open={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        selectedItems={selectedItems}
        onComplete={onComplete}
      />
    </PremiumSurface>
  );
}

export function InventoryBulkEditDialog({
  labId,
  orgId,
  open,
  onOpenChange,
  selectedItems,
  onComplete,
}: {
  labId: string;
  orgId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: Entity[];
  onComplete: () => Promise<void>;
}) {
  const [threshold, setThreshold] = useState("");
  const [isActive, setIsActive] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function applyBulkUpdate() {
    if (!selectedItems.length) {
      toast.error("No items selected.");
      return;
    }
    setIsSubmitting(true);
    try {
      const items = selectedItems.map((item) => {
        const patch: Record<string, unknown> = { id: item.id };
        if (threshold !== "") patch.threshold = threshold;
        if (isActive !== "") patch.is_active = isActive === "true";
        if (quantity !== "") patch.quantity = quantity;
        return patch;
      });
      const response = await apiClient.create<BulkResponse>(
        endpoints.inventory.itemsBulk(labId),
        { action: "update", items },
        { orgId }
      );
      const failed = (response.data?.results ?? []).filter((r) => !r.success);
      if (failed.length) {
        toast.error(failed[0].errors?.join(" ") ?? "Some rows failed to update.");
      } else {
        toast.success("Bulk update applied.");
        onOpenChange(false);
        await onComplete();
      }
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk edit {selectedItems.length} item(s)</DialogTitle>
          <DialogDescription>Leave fields empty to keep existing values.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-qty">Quantity (current unit)</Label>
            <Input
              id="bulk-qty"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Leave empty to skip"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-threshold">Threshold (all selected)</Label>
            <Input
              id="bulk-threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Leave empty to skip"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-active">Active status</Label>
            <Input
              id="bulk-active"
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              placeholder="true or false (empty = skip)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={applyBulkUpdate}>
            {isSubmitting ? "Saving…" : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

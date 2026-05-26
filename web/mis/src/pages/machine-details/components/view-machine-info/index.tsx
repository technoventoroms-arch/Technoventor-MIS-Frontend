import CanIUse from "@/components/shared/can-i-use";
import { IMachine } from "@/interfaces/machines";
import { regenerateApiKey } from "@/services/machine.service";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Copy, Edit, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  machineDetails: IMachine | null;
  onEditClick: () => void;
  canEditMachine: boolean;
  updateApiKey: (key: string) => void;
};

const ViewMachineInfo = ({
  machineDetails,
  onEditClick,
  canEditMachine,
  updateApiKey,
}: Props) => {
  const [changeApiKeyModal, setChangeApiKeyModal] = useState(false);
  const { ApiKeyloading, hideApiKeyLoading, showApiKeyLoading } =
    useLoading("ApiKey");

  const handleRegenerateApiKey = async () => {
    showApiKeyLoading();
    try {
      const res = await regenerateApiKey(machineDetails!.id!);
      if (!res.error) {
        updateApiKey(res.data.api_key!);
        setChangeApiKeyModal(false);
        toast.success("API Key regenerated successfully");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideApiKeyLoading();
    }
  };
  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard?.writeText(machineDetails?.api_key || "");
      toast.success("API Key copied to clipboard");
    } catch (error) {
      toast.error(`Unable to copy API Key`);
    }
  };
  return (
    <div className="flex gap-2 flex-col md:flex-row">
      <span className="p-2 flex-1">
        <img
          className="rounded-md   max-w-xl h-64"
          src={machineDetails?.image_link}
        />
      </span>
      <div className="p-2 px-4 space-y-3 flex-1 ">
        <div className="flex justify-between items-start md:items-end gap-2  overflow-hidden">
          <div className="flex-1 w-full">
            <div className="text-xs">Machine Name</div>
            <div className="text-lg font-semibold text-wrap break-words">
              {machineDetails?.name}
            </div>
          </div>
          <div className=" ">
            {canEditMachine && (
              <Button
                onClick={onEditClick}
                size={"icon"}
                rounded={"sm"}
                variant={"gray"}
              >
                <Edit />
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs">Status</div>
          <div className="text-lg font-semibold">
            <Badge className="text-sm " variant={"indigo"}>
              {machineDetails?.status}
            </Badge>
          </div>
        </div>
        <div className="">
          <div className="text-xs">Description</div>
          <div className="text-lg font-semibold">
            {machineDetails?.description}
          </div>
        </div>
        <div className="">
          <div className="text-xs">API Key</div>
          <div className="text-lg font-semibold">
            {machineDetails?.api_key || "--"}{" "}
            <Button
              variant={"green"}
              size={"sm"}
              rounded={"sm"}
              onClick={handleCopyApiKey}
            >
              <Copy />
            </Button>
          </div>
          <CanIUse action={(e) => e.UPDATE_MACHINES}>
            <div className="text-lg font-semibold">
              <Button
                variant={"ghost"}
                size={"sm"}
                onClick={() => setChangeApiKeyModal(true)}
              >
                Regenerate API Key
              </Button>
            </div>
          </CanIUse>
        </div>
      </div>
      <Dialog
        open={!!changeApiKeyModal}
        onOpenChange={() => {
          !ApiKeyloading && setChangeApiKeyModal(false);
        }}
      >
        <DialogContent
          disabled={ApiKeyloading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">Change Machine Api Key</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for creating new user.
          </DialogDescription>
          <div className="p-4 pt-0 space-y-4">
            This action will invalidate the current API key and any machines
            using it will stop working.
            <div className="text-lg font-semibold pt-1 space-x-2">
              <Button
                variant={"red"}
                size={"sm"}
                onClick={() => setChangeApiKeyModal(false)}
                disabled={ApiKeyloading}
              >
                Cancel
              </Button>
              <Button
                variant={"indigo"}
                size={"sm"}
                onClick={handleRegenerateApiKey}
                disabled={ApiKeyloading}
              >
                {ApiKeyloading ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Regenerate New API Key"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewMachineInfo;

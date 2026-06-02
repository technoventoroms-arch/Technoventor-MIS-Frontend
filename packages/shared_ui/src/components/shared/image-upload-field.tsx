"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { upload } from "@imagekit/javascript";

import { Button } from "@mono/shared_ui/components/ui/button";
import { Input } from "@mono/shared_ui/components/ui/input";
import { Progress } from "@mono/shared_ui/components/ui/progress";

type ImageKitAuthParams = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
};

type ImageUploadFieldProps = {
  value: string;
  onChange: (value: string) => void;
  authenticator: () => Promise<ImageKitAuthParams>;
  folder: string;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  helper?: string;
  maxSizeMb?: number;
};

const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

export function ImageUploadField({
  value,
  onChange,
  authenticator,
  folder,
  id,
  name,
  placeholder,
  required,
  helper,
  maxSizeMb = 10,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const maxSizeBytes = useMemo(() => maxSizeMb * 1024 * 1024, [maxSizeMb]);

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setUploadError(null);
    setProgress(0);

    if (!selectedFile.type.startsWith("image/")) {
      setUploadError("Please choose a valid image file.");
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setUploadError(`Image size must be ${maxSizeMb}MB or less.`);
      return;
    }

    setIsUploading(true);
    try {
      const auth = await authenticator();
      const uploadResult = await upload({
        file: selectedFile,
        fileName: selectedFile.name,
        token: auth.token,
        expire: auth.expire,
        signature: auth.signature,
        publicKey: auth.publicKey,
        folder,
        useUniqueFileName: true,
        onProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }
          setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });

      const uploadedUrl = (uploadResult as { url?: string }).url;
      if (!uploadedUrl) {
        throw new Error("Upload completed, but no image URL was returned.");
      }
      onChange(uploadedUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="overflow-hidden rounded-md border bg-muted">
          <img src={value} alt="Uploaded preview" className="h-36 w-full object-cover" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={id}
          name={name}
          value={value}
          required={required}
          placeholder={placeholder ?? "https://ik.imagekit.io/..."}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button type="button" variant="outline" disabled={isUploading} asChild>
          <label className="cursor-pointer">
            {isUploading ? "Uploading..." : "Upload image"}
            <input
              type="file"
              className="hidden"
              accept={ACCEPTED_IMAGE_TYPES}
              onChange={(event) => void handleFileUpload(event)}
              disabled={isUploading}
            />
          </label>
        </Button>
      </div>

      {isUploading ? <Progress value={progress} /> : null}
      {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

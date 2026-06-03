import { cn } from "@mono/shared_ui/lib/utils";
import React, { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@mono/shared_ui/components/ui/button";

// Define props interface
interface ImageUploadProps {
  onImageUpload?: (file: File) => Promise<void>;
  accept?: string;
  maxSizeKB?: number;
  name: string;
  defaultValue: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  accept = "image/*",
  maxSizeKB = 300,
  name,
  defaultValue,
}) => {
  const { formState, setError, clearErrors, setValue } = useFormContext();
  const [preview, setPreview] = useState<string>(defaultValue || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const maxSizeBytes = maxSizeKB * 1024;
  const { errors } = formState;
  // Handle file selection and validation
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    const file = files?.[0];
    setIsUploading(true);

    if (!file) {
      setError(name, { message: "No file selected" });
      setIsUploading(false);

      return;
    }

    // Validate file type
    if (!file.type.match(accept)) {
      setError(name, {
        message: `Please select a valid image file (${accept})`,
      });
      setIsUploading(false);
      return;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      const fileSizeKB = (file.size / 1024).toFixed(2);

      setError(name, {
        message: `Image size should not exceed ${maxSizeKB}KB. Current size: ${fileSizeKB}KB`,
      });
      setIsUploading(false);

      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.onerror = () => {
      setError(name, {
        message: "Error reading file",
      });
    };
    reader.readAsDataURL(file);
    try {
      await onImageUpload?.(file);
      clearErrors(name);
    } catch (error: any) {
      setPreview("");
      setError(name, {
        message: error.message,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setIsUploading(false);
  };

  function handleRemoveImage() {
    setPreview("");
    setValue(name, "", { shouldDirty: true, shouldValidate: true });
    clearErrors(name);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          {preview ? (
            <div className="relative w-full h-full rounded-md overflow-hidden p-2">
              <img
                src={preview}
                alt="Preview"
                className={cn(
                  "w-full h-full rounded-md object-cover",
                  isUploading
                    ? "animate-pulse opacity-75 cursor-not-allowed"
                    : ""
                )}
              />
              {!isUploading ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-4"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <X className="size-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SVG, PNG, JPG or GIF (MAX. 300kb)
              </p>
            </div>
          )}
          <input
            id="dropzone-file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
            ref={fileInputRef}
          />
        </label>
      </div>
      {errors[name] && (
        <div className="text-destructive text-sm">
          {errors[name]?.message?.toString()}
        </div>
      )}
    </>
  );
};

export default ImageUpload;

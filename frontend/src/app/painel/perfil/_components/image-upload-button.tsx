"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadButtonProps {
  label: string;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
}

export function ImageUploadButton({ label, isUploading, onUpload }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await onUpload(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? "Enviando..." : label}
      </Button>
    </>
  );
}

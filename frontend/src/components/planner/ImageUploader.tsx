import { useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUploader({
  label = "Outfit image (optional)",
  onChange,
}: {
  label?: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a JPEG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    onChange(file);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 20;
      });
    }, 80);
  };

  const remove = () => {
    setPreview(null);
    setFileName(null);
    setProgress(0);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {preview ? (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
          <img
            src={preview}
            alt={`Preview of ${fileName ?? "selected outfit"}`}
            className="size-20 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
            <Progress value={progress} className="mt-2" aria-label="Upload progress" />
            <p className="mt-1 text-xs text-muted-foreground">
              {progress >= 100 ? "Ready to send with your plan" : "Preparing image…"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={remove}
            aria-label="Remove image"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleFile(event.dataTransfer.files?.[0]);
          }}
          className={`flex flex-col items-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors ${
            dragging ? "border-primary bg-secondary" : "border-border bg-card"
          }`}
        >
          <ImageUp className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-sm text-foreground">Drag and drop an outfit photo</p>
          <p className="text-xs text-muted-foreground">JPEG, PNG or WEBP · up to 5 MB</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => inputRef.current?.click()}
          >
            Browse file
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        aria-label={label}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

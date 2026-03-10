"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, ImageOff, PlayCircle } from "lucide-react";

import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/youtube";

interface ExerciseMediaProps {
  exercisedbGifUrl: string | null;
  youtubeUrl: string | null;
  exerciseName: string;
  compact?: boolean;
}

export function ExerciseMedia({
  exercisedbGifUrl,
  youtubeUrl,
  exerciseName,
  compact = false,
}: ExerciseMediaProps) {
  const [gifFailed, setGifFailed] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  const videoId = useMemo(
    () => (youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null),
    [youtubeUrl],
  );
  const thumbnailUrl = useMemo(
    () => (youtubeUrl ? getYouTubeThumbnailUrl(youtubeUrl) : null),
    [youtubeUrl],
  );

  if (videoId && youtubeUrl) {
    if (compact) {
      return (
        <Link
          href={youtubeUrl}
          target="_blank"
          rel="noreferrer"
          className="group block overflow-hidden rounded-lg border border-border bg-muted/30"
        >
          {thumbnailUrl && !thumbnailFailed ? (
            <div className="relative aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={`Thumbnail do vídeo de ${exerciseName}`}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setThumbnailFailed(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/35 text-white transition-colors group-hover:bg-black/45">
                <PlayCircle className="size-10" />
              </div>
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
              <PlayCircle className="size-8" />
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
            <span>Vídeo do YouTube</span>
            <ExternalLink className="size-3.5" />
          </div>
        </Link>
      );
    }

    return (
      <div className="overflow-hidden rounded-lg border border-border bg-black">
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={`Demonstração: ${exerciseName}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  if (exercisedbGifUrl && !gifFailed) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={exercisedbGifUrl}
          alt={`Demonstração de ${exerciseName}`}
          className={compact ? "aspect-video w-full object-cover" : "max-h-64 w-full object-contain"}
          loading="lazy"
          onError={() => setGifFailed(true)}
        />
        {compact ? (
          <div className="px-3 py-2 text-xs text-muted-foreground">GIF automático</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
      <ImageOff className="size-4" />
      <span>Sem demonstração disponível</span>
    </div>
  );
}

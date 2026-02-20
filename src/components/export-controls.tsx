"use client";

import { RefObject, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { HiMiniFilm, HiMiniPhoto } from "react-icons/hi2";
import { CgSpinnerTwo } from "react-icons/cg";

interface ExportControlsProps {
  canvasContainerRef: RefObject<HTMLDivElement | null>;
  onReplay: () => void;
}

function getCanvasElement(
  containerRef: RefObject<HTMLDivElement | null>
): HTMLCanvasElement | null {
  return containerRef.current?.querySelector("canvas") ?? null;
}

export function ExportControls({
  canvasContainerRef,
  onReplay,
}: ExportControlsProps) {
  const [exportingVideo, setExportingVideo] = useState(false);
  const [exportingGif, setExportingGif] = useState(false);

  const exportVideo = useCallback(async () => {
    const canvas = getCanvasElement(canvasContainerRef);
    if (!canvas) return;

    setExportingVideo(true);
    onReplay();

    await new Promise((r) => setTimeout(r, 100));

    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "penflo-animation.webm";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportingVideo(false);
      };

      recorder.start();

      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, 6000);
    } catch {
      setExportingVideo(false);
    }
  }, [canvasContainerRef, onReplay]);

  const exportGif = useCallback(async () => {
    const canvas = getCanvasElement(canvasContainerRef);
    if (!canvas) return;

    setExportingGif(true);
    onReplay();

    await new Promise((r) => setTimeout(r, 100));

    try {
      const { default: GIF } = await import("gif.js");

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: canvas.width,
        height: canvas.height,
        workerScript: "/gif.worker.js",
      });

      const totalFrames = 90;
      const frameDelay = 1000 / 30;

      let frameCount = 0;
      const captureFrame = () => {
        if (frameCount >= totalFrames) {
          gif.render();
          return;
        }
        gif.addFrame(canvas, { delay: frameDelay, copy: true });
        frameCount++;
        requestAnimationFrame(captureFrame);
      };

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "penflo-animation.gif";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportingGif(false);
      });

      gif.on("error", () => {
        setExportingGif(false);
      });

      requestAnimationFrame(captureFrame);
    } catch {
      try {
        const canvas = getCanvasElement(canvasContainerRef);
        if (!canvas) {
          setExportingGif(false);
          return;
        }
        canvas.toBlob((blob) => {
          if (!blob) {
            setExportingGif(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "penflo-snapshot.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setExportingGif(false);
        }, "image/png");
      } catch {
        setExportingGif(false);
      }
    }
  }, [canvasContainerRef, onReplay]);

  return (
    <div className="mt-3 flex gap-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={exportVideo}
        disabled={exportingVideo}
        className="gap-2 text-xs rounded-xl border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all"
      >
        {exportingVideo ? (
          <CgSpinnerTwo className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <HiMiniFilm className="h-3.5 w-3.5" />
        )}
        {exportingVideo ? "Recording..." : "Export Video"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportGif}
        disabled={exportingGif}
        className="gap-2 text-xs rounded-xl border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all"
      >
        {exportingGif ? (
          <CgSpinnerTwo className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <HiMiniPhoto className="h-3.5 w-3.5" />
        )}
        {exportingGif ? "Exporting..." : "Export GIF"}
      </Button>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RotateCcw, Loader2, VideoOff } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Face verification step — webcam capture for exam session face registration.
 * Captures a JPEG snapshot from the webcam, validates size/format,
 * and returns a Blob ready for FormData.
 *
 * @param {{ onCapture: (blob: Blob) => void, isLoading: boolean }} props
 */
export default function FaceVerificationStep({ onCapture, isLoading }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [permissionState, setPermissionState] = useState("prompt"); // prompt | granted | denied
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionState("granted");
    } catch (err) {
      setPermissionState("denied");
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permissions and try again.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found. Please connect a webcam.");
      } else {
        setError("Unable to access camera. Please check your device settings.");
      }
    }
  }, []);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      // Clean up stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Failed to capture image. Please try again.");
          return;
        }
        if (blob.size > MAX_FILE_SIZE) {
          setError("Image too large. Please try again with better lighting.");
          return;
        }
        setCapturedImage(URL.createObjectURL(blob));
        // Store blob for submission
        canvas._capturedBlob = blob;
      },
      "image/jpeg",
      0.85
    );
  }

  function handleRetake() {
    setCapturedImage(null);
    setError(null);
    if (canvasRef.current) {
      canvasRef.current._capturedBlob = null;
    }
  }

  function handleConfirm() {
    const blob = canvasRef.current?._capturedBlob;
    if (blob) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      onCapture(blob);
    }
  }

  return (
    <div className="w-full relative overflow-hidden rounded-comfortable">
      {/* Watermark */}
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-[0.03]">
        <div className="flex flex-col items-center transform -rotate-45 scale-[2.5] md:scale-[3.5]">
          <img src="/logo.png" alt="Veritas" className="w-[200px] object-contain mb-4" />
          <span className="text-[60px] md:text-[80px] font-black tracking-[0.3em] text-notion-black">VERITAS</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-6 pt-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-comfortable bg-notion-blue/10 mb-4 shadow-sm border border-notion-blue/5">
            <Camera size={28} className="text-notion-blue" />
          </div>
          <h2 className="text-[20px] font-bold text-notion-black leading-tight">
            Face Registration
          </h2>
          <p className="text-[14px] text-warm-gray-500 mt-1.5">
            Take a clear photo of your face for identity verification.
          </p>
        </div>

      {/* Camera / Preview area */}
      <div className="relative w-full max-w-sm mx-auto aspect-[4/3] rounded-standard overflow-hidden bg-warm-dark mb-4">
        {permissionState === "denied" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
            <VideoOff size={40} className="text-warm-gray-300" />
            <p className="text-[13px] text-warm-gray-300">{error}</p>
            <button
              type="button"
              onClick={startCamera}
              className="text-[13px] text-notion-blue hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured face"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
        )}

        {/* Oval guide overlay (only when camera is live) */}
        {permissionState === "granted" && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-48 h-60 border-2 border-white/40 rounded-full"
              style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)" }}
            />
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error message */}
      {error && permissionState !== "denied" && (
        <p className="text-[12px] text-destructive text-center mb-3">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        {capturedImage ? (
          <>
            <button
              type="button"
              onClick={handleRetake}
              disabled={isLoading}
              className="
                flex items-center gap-2 px-5 py-2.5
                text-[14px] font-medium text-notion-black
                border border-whisper rounded-subtle
                hover:bg-warm-white transition-colors
                disabled:opacity-50
              "
            >
              <RotateCcw size={15} />
              Retake
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="
                flex items-center gap-2 px-5 py-2.5
                text-[14px] font-medium text-white
                bg-notion-blue rounded-subtle
                hover:bg-active-blue transition-colors
                disabled:opacity-50
              "
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Starting Exam...
                </>
              ) : (
                "Start Exam"
              )}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleCapture}
            disabled={permissionState !== "granted"}
            className="
              flex items-center gap-2 px-6 py-2.5
              text-[14px] font-medium text-white
              bg-notion-blue rounded-subtle
              hover:bg-active-blue transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Camera size={15} />
            Capture Photo
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, X, ImageIcon, AlertCircle } from 'lucide-react';

interface UploadScreenProps {
  onImageSelected: (imageData: string) => void;
  onBack: () => void;
  mode: 'upload' | 'camera';
  submissionError?: string | null;
}

export function UploadScreen({ onImageSelected, onBack, mode, submissionError }: UploadScreenProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError('Image too large. Please use an image under 8 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.onerror = () => setError('Could not read the selected file.');
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setError('Camera is still warming up. Please try again in a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext('2d');
    if (!context) {
      setError('Unable to capture the camera photo. Please try again.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPreview(canvas.toDataURL('image/jpeg', 0.92));
    stopCameraStream();
  }, [stopCameraStream]);

  const startCameraStream = useCallback(async () => {
    if (mode !== 'camera' || preview) {
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('This browser does not support camera access. Please upload a photo instead.');
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (cameraError) {
      console.error('Camera access failed:', cameraError);
      setError('Camera access was blocked or unavailable. Please upload a photo instead.');
      stopCameraStream();
    }
  }, [mode, preview, stopCameraStream]);

  useEffect(() => {
    if (mode === 'camera' && !preview) {
      void startCameraStream();
    } else if (mode !== 'camera' || preview) {
      stopCameraStream();
    }

    return () => stopCameraStream();
  }, [mode, preview, startCameraStream, stopCameraStream]);

  const handleRetake = () => {
    setPreview(null);
    setError(null);
  };

  const isCamera = mode === 'camera';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/30 to-white">
      <div className="max-w-md mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            {isCamera ? 'Take a Photo' : 'Upload a Photo'}
          </h2>
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        {(error || submissionError) && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error || submissionError}</p>
          </div>
        )}

        {!preview && !isCamera ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all min-h-[320px] flex flex-col items-center justify-center p-8 text-center ${
              isDragging
                ? 'border-teal-500 bg-teal-50 scale-[1.01]'
                : 'border-slate-300 bg-white hover:border-teal-400 hover:bg-teal-50/30'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg mb-4">
              <Upload size={30} className="text-white" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Drop Image Here</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Drag and drop a fish photo, or tap to browse
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
              <ImageIcon size={14} />
              <span>JPG, PNG, WEBP — up to 8 MB</span>
            </div>
          </div>
        ) : !preview && isCamera ? (
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-lg">
            <div className="relative h-[420px] bg-slate-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full border border-white/20 bg-slate-900/60 px-3 py-1 text-[11px] font-medium tracking-wide text-slate-200 backdrop-blur-sm">
                    Live camera
                  </div>
                  <button
                    onClick={() => {
                      stopCameraStream();
                      cameraInputRef.current?.click();
                    }}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
                  >
                    Use gallery
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white">
              <button
                onClick={handleCapture}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Camera size={18} />
                Capture Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              <img src={preview ?? undefined} alt="Fish preview" className="w-full object-contain max-h-[400px] bg-slate-900" />
              <button
                onClick={handleRetake}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <X size={18} className="text-slate-700" />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-3.5 rounded-2xl bg-white border border-slate-200 font-semibold text-slate-700 text-sm hover:bg-slate-50 transition-colors"
              >
                Choose Different
              </button>
              <button
                onClick={() => {
                  if (preview) {
                    onImageSelected(preview);
                  }
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Analyze Fish
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="mt-6 p-4 bg-teal-50/60 rounded-2xl border border-teal-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Tips for best results</h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li>• Photograph one fish, centered, from the side</li>
            <li>• Include the whole fish, especially its fins and tail</li>
            <li>• Use bright, even light and a plain background that contrasts with the fish</li>
            <li>• Keep hands, containers, and other objects out of the frame</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

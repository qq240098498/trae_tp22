import { useRef, useState } from "react";
import { Camera, ImagePlus, X, Loader2, CheckCircle2 } from "lucide-react";
import { compressImage, compressImageFromVideo, validateImageFile } from "@/utils/image";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUploadedIdx, setLastUploadedIdx] = useState<number | null>(null);

  const remaining = maxImages - images.length;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setLastUploadedIdx(null);
    try {
      const processed: string[] = [];
      for (const file of Array.from(files)) {
        const err = validateImageFile(file);
        if (err) {
          alert(`${file.name}: ${err}`);
          continue;
        }
        if (images.length + processed.length >= maxImages) break;
        const dataUrl = await compressImage(file);
        processed.push(dataUrl);
      }
      const next = [...images, ...processed];
      onChange(next);
      if (processed.length > 0) {
        setLastUploadedIdx(next.length - 1);
        setTimeout(() => setLastUploadedIdx(null), 1500);
      }
    } catch (err) {
      alert("图片处理失败: " + (err instanceof Error ? err.message : "未知错误"));
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function startCamera() {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => void 0);
      }
      setShowCamera(true);
    } catch (err) {
      setCameraError(
        "无法访问摄像头：" +
          (err instanceof Error ? err.message : "请检查浏览器权限设置，或使用从文件选择方式。")
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }

  async function capturePhoto() {
    if (!videoRef.current) return;
    setIsCapturing(true);
    try {
      const dataUrl = await compressImageFromVideo(videoRef.current);
      if (images.length < maxImages) {
        const next = [...images, dataUrl];
        onChange(next);
        setLastUploadedIdx(next.length - 1);
        setTimeout(() => setLastUploadedIdx(null), 1500);
      }
    } catch (err) {
      alert("拍照失败：" + (err instanceof Error ? err.message : "未知"));
    } finally {
      setIsCapturing(false);
    }
  }

  function removeImage(idx: number) {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 shadow-sm group animate-slide-up ${
                lastUploadedIdx === idx
                  ? "border-status-good ring-2 ring-status-good/40"
                  : "border-wood-200 hover:border-safety-orange/60"
              }`}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <img src={img} alt={`图片${idx + 1}`} className="w-full h-full object-cover" />
              {lastUploadedIdx === idx && (
                <div className="absolute inset-0 bg-status-good/20 flex items-center justify-center pointer-events-none">
                  <CheckCircle2 size={32} className="text-status-good drop-shadow" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-status-alert"
                aria-label="删除图片"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCamera && (
        <div className="rounded-xl overflow-hidden border-2 border-safety-orange/50 bg-black animate-fade-in">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-status-alert/90 text-white text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              实时预览中
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-wood-900 flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-lg bg-wood-700 text-wood-100 text-sm font-medium hover:bg-wood-600 transition min-h-[44px]"
            >
              关闭摄像头
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isCapturing}
              className="flex-1 sm:flex-none min-w-[140px] px-5 py-2.5 rounded-lg bg-safety-gradient text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-glow transition disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isCapturing ? (
                <Loader2 size={18} className="animate-spin" strokeWidth={2.2} />
              ) : (
                <Camera size={18} strokeWidth={2.2} />
              )}
              {isCapturing ? "拍照中..." : "拍摄照片"}
            </button>
          </div>
        </div>
      )}

      {cameraError && !showCamera && (
        <div className="p-3 rounded-lg bg-status-alert/10 border border-status-alert/30 text-sm text-status-alert animate-fade-in">
          {cameraError}
        </div>
      )}

      {remaining > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startCamera}
            disabled={isProcessing}
            className="group relative min-h-[140px] rounded-xl border-2 border-dashed border-wood-300 bg-wood-50/50 hover:border-safety-orange hover:bg-safety-orange/5 transition-all flex flex-col items-center justify-center gap-2 p-4 disabled:opacity-60"
          >
            <div className="w-14 h-14 rounded-2xl bg-safety-orange/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-safety-orange/15 transition">
              <Camera size={26} className="text-safety-orange" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-wood-800">调用摄像头拍照</p>
              <p className="text-xs text-wood-500 mt-0.5">实时拍摄存放位置 / 工具照片</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="group relative min-h-[140px] rounded-xl border-2 border-dashed border-wood-300 bg-wood-50/50 hover:border-wood-500 hover:bg-wood-100 transition-all flex flex-col items-center justify-center gap-2 p-4 disabled:opacity-60"
          >
            <div className="w-14 h-14 rounded-2xl bg-wood-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-wood-300 transition">
              <ImagePlus size={26} className="text-wood-600" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-wood-800">从相册/文件选择</p>
              <p className="text-xs text-wood-500 mt-0.5">最多 {remaining} 张，自动压缩优化</p>
            </div>
            {isProcessing && (
              <div className="absolute inset-0 bg-wood-50/80 rounded-xl flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-safety-orange" />
                <span className="ml-2 text-sm font-medium text-wood-700">处理中...</span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-wood-500">
          已添加 <span className="font-bold text-wood-700">{images.length}</span> / {maxImages} 张图片。
          将鼠标悬停在图片上可删除。
        </p>
      )}
    </div>
  );
}

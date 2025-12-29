import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilmFlicker } from "../components/FilmFlicker";
import { FilmArtifacts } from "../components/FilmArtifacts";
import { CustomSelect } from "../components/CustomSelect";

type FilterType = 'none' | 'grayscale(100%)' | 'sepia(100%)' | 'invert(100%)' | 'blur(3px)' | 'contrast(200%)';
type TimerType = 'off' | '3' | '5' | '10';
type PhotoCountType = '1' | '2' | '3' | '4';

export default function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoStripRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [filter, setFilter] = useState<FilterType>('none');
  const [timer, setTimer] = useState<TimerType>('off');
  const [photoCount, setPhotoCount] = useState<PhotoCountType>('1');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [showCharLimitWarning, setShowCharLimitWarning] = useState(false);
  const textMeasureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Start webcam
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      }
    })
      .then(mediaStream => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(err => {
        console.error('Webcam error:', err);
        alert('Unable to access webcam. Please grant camera permissions.');
      });

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePicture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply filter and draw
    context.filter = filter;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = canvas.toDataURL('image/png');

    return imageData;
  };

  const captureMultiplePhotos = async (count: number) => {
    const images: string[] = [];

    for (let i = 0; i < count; i++) {
      setCurrentPhotoIndex(i + 1);

      // Only use timer if user selected one (not 'off')
      if (timer !== 'off') {
        const seconds = parseInt(timer);
        setCountdown(seconds);

        await new Promise<void>(resolve => {
          let remaining = seconds;
          const interval = setInterval(() => {
            remaining--;
            setCountdown(remaining);

            if (remaining <= 0) {
              clearInterval(interval);
              setCountdown(null);
              resolve();
            }
          }, 1000);
        });
      }

      // Take the photo
      const image = takePicture();
      if (image) {
        images.push(image);
      }
    }

    setCapturedImages(images);
    setIsCapturing(false);
    setCurrentPhotoIndex(0);
    setCountdown(null);
  };

  const capturePhoto = async () => {
    const count = parseInt(photoCount);
    setIsCapturing(true);
    await captureMultiplePhotos(count);
  };

  const retakePhoto = () => {
    setCapturedImages([]);
    setCurrentPhotoIndex(0);
    setCustomNote('');
  };

  const downloadPhoto = async () => {
    if (capturedImages.length === 0 || !photoStripRef.current) return;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(photoStripRef.current, {
        backgroundColor: '#f5e6d3',
        scale: 2,
        logging: false,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `vintage-photobooth-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: download individual images
      capturedImages.forEach((image, index) => {
        const link = document.createElement('a');
        link.href = image;
        link.download = `vintage-photo-${Date.now()}-${index + 1}.png`;
        link.click();
      });
    }
  };

  const goBack = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/');
  };

  return (
    <div className="relative w-full min-h-screen bg-[#1a0f0a] overflow-hidden flex items-center justify-center py-4 md:py-8 px-2 sm:px-4">
      {/* Flickering overlay effect */}
      <FilmFlicker />

      {/* Film artifacts (scratches, dust, lines) */}
      <FilmArtifacts />

      {/* Flash effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-flash" />
      )}

      {/* Main content */}
      <div className="relative z-40 w-full max-w-4xl px-2 sm:px-4">
        <h1 className="text-[#f5e6d3] text-center tracking-wide text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6">
          Vintage Photobooth
        </h1>

        {/* Camera/Photo frame */}
        <div className="relative mx-auto mb-4 md:mb-6 w-full max-w-2xl">
          <div className="relative">
            {capturedImages.length === 0 ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto rounded"
                  style={{ filter }}
                />
                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded">
                    <div className="text-[#ffe8b3] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold animate-pulse">
                      {countdown}
                    </div>
                    {currentPhotoIndex > 0 && (
                      <div className="text-[#f5e6d3] text-xl sm:text-2xl md:text-3xl mt-4">
                        Photo {currentPhotoIndex} of {photoCount}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div ref={photoStripRef} className="relative bg-[#f5e6d3] p-6 rounded-lg shadow-xl max-w-sm mx-auto">
                {/* Photos in vertical strip */}
                <div className="flex flex-col gap-3">
                  {capturedImages.map((image, index) => (
                    <div key={index} className="relative bg-white p-1 shadow-sm">
                      <img
                        src={image}
                        alt={`Captured ${index + 1}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </div>

                {/* Custom note input */}
                <div className="mt-3 text-center pb-2 overflow-visible relative">
                  {/* Hidden span to measure text width */}
                  <span
                    ref={textMeasureRef}
                    className="absolute invisible whitespace-nowrap px-2 font-serif italic text-base"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    aria-hidden="true"
                  >
                    {customNote || 'M'}
                  </span>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // Check if text would overflow using the hidden span
                      if (textMeasureRef.current) {
                        const containerWidth = e.target.offsetWidth - 16; // Account for padding
                        textMeasureRef.current.textContent = newValue;
                        const textWidth = textMeasureRef.current.offsetWidth;

                        if (textWidth > containerWidth && newValue.length > customNote.length) {
                          // Text would overflow, show warning and prevent
                          setShowCharLimitWarning(true);
                          setTimeout(() => setShowCharLimitWarning(false), 2000);
                          return;
                        }
                      }
                      setShowCharLimitWarning(false);
                      setCustomNote(newValue);
                    }}
                    placeholder="Add a note..."
                    className="w-full px-2 py-1 text-center bg-transparent border-none text-[#8B6914] placeholder-[#8B6914] placeholder-opacity-50 focus:outline-none font-serif italic text-base"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: '#8B6914',
                      lineHeight: '1.5'
                    }}
                  />
                  {/* Character limit warning */}
                  {showCharLimitWarning && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -bottom-6 text-xs text-red-600 bg-red-50 px-2 py-1 rounded shadow-sm whitespace-nowrap animate-pulse"
                      style={{ fontFamily: 'sans-serif', fontStyle: 'normal' }}
                    >
                      Can't add more characters ✋
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter, Timer and Photo Count selection */}
        {capturedImages.length === 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-6 mb-4 md:mb-6">
            <CustomSelect
              label="Choose Filter"
              value={filter}
              onChange={(value) => setFilter(value as FilterType)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'grayscale(100%)', label: 'Grayscale' },
                { value: 'sepia(100%)', label: 'Sepia' },
                { value: 'invert(100%)', label: 'Invert' },
                { value: 'blur(3px)', label: 'Blur' },
                { value: 'contrast(200%)', label: 'High Contrast' }
              ]}
            />

            <CustomSelect
              label="Timer"
              value={timer}
              onChange={(value) => setTimer(value as TimerType)}
              disabled={isCapturing}
              options={[
                { value: 'off', label: 'Off' },
                { value: '3', label: '3 sec' },
                { value: '5', label: '5 sec' },
                { value: '10', label: '10 sec' }
              ]}
            />

            <CustomSelect
              label="Photo Count"
              value={photoCount}
              onChange={(value) => setPhotoCount(value as PhotoCountType)}
              disabled={isCapturing}
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' }
              ]}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={goBack}
            className="px-6 sm:px-8 py-3 bg-[#4a3828] hover:bg-[#5a4838] text-[#f5e6d3] rounded-md tracking-[0.2em] transition-all uppercase text-xs sm:text-sm font-semibold shadow-lg w-full sm:w-auto"
          >
            ← Back
          </button>

          {capturedImages.length === 0 ? (
            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="px-6 sm:px-8 py-3 bg-[#4a3828] hover:bg-[#5a4838] text-[#f5e6d3] rounded-md tracking-[0.2em] transition-all uppercase text-xs sm:text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isCapturing ? 'Capturing...' : '˗ˏˋClickˎˊ˗'}
            </button>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="px-6 sm:px-8 py-3 bg-[#4a3828] hover:bg-[#5a4838] text-[#f5e6d3] rounded-md tracking-[0.2em] transition-all uppercase text-xs sm:text-sm font-semibold shadow-lg w-full sm:w-auto"
              >
                ⟳ Retake
              </button>
              <button
                onClick={downloadPhoto}
                className="px-6 sm:px-8 py-3 bg-[#5a4838] hover:bg-[#6a5848] text-[#f5e6d3] rounded-md tracking-[0.2em] transition-all uppercase text-xs sm:text-sm font-semibold shadow-lg w-full sm:w-auto"
              >
                ⬇ Download
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

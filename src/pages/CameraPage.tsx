import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilmStrip } from "../components/FilmStrip";
import { FilmFlicker } from "../components/FilmFlicker";
import { FilmArtifacts } from "../components/FilmArtifacts";
import { CustomSelect } from "../components/CustomSelect";

type FilterType = 'none' | 'grayscale(100%)' | 'sepia(100%)' | 'invert(100%)' | 'blur(3px)' | 'contrast(200%)';
type TimerType = 'off' | '3' | '5' | '10';

export default function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [filter, setFilter] = useState<FilterType>('none');
  const [timer, setTimer] = useState<TimerType>('off');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);

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
    setCapturedImage(imageData);
    setCountdown(null);
  };

  const capturePhoto = () => {
    if (timer === 'off') {
      takePicture();
    } else {
      // Start countdown
      const seconds = parseInt(timer);
      setCountdown(seconds);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            takePicture();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const downloadPhoto = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `vintage-photo-${Date.now()}.png`;
    link.click();
  };

  const goBack = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/');
  };

  return (
    <div className="relative w-full min-h-screen bg-[#1a0f0a] overflow-hidden flex items-center justify-center py-8">
      {/* Flickering overlay effect */}
      <FilmFlicker />

      {/* Film artifacts (scratches, dust, lines) */}
      <FilmArtifacts />

      {/* Film strip borders */}
      <FilmStrip side="left" />
      <FilmStrip side="right" />
      <FilmStrip side="top" />
      <FilmStrip side="bottom" />

      {/* Flash effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-flash" />
      )}

      {/* Main content */}
      <div className="relative z-40 w-full max-w-4xl px-4">
        <h1 className="text-[#f5e6d3] text-center tracking-wide text-4xl md:text-5xl mb-6">
          Vintage Photobooth
        </h1>

        {/* Camera/Photo frame */}
        <div className="relative mx-auto mb-6 max-w-2xl">
          <div className="relative bg-[#2d1810] p-2 md:p-4 rounded-lg border-4 border-[#4a3828] shadow-2xl">
            {!capturedImage ? (
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                    <div className="text-[#ffe8b3] text-9xl font-bold animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto rounded"
              />
            )}
          </div>
        </div>

        {/* Filter and Timer selection */}
        {!capturedImage && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6 flex-wrap">
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
              disabled={countdown !== null}
              options={[
                { value: 'off', label: 'Off' },
                { value: '3', label: '3 sec' },
                { value: '5', label: '5 sec' },
                { value: '10', label: '10 sec' }
              ]}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={goBack}
            className="px-8 py-3 bg-[#4a3828] hover:bg-[#5a4838] text-[#f5e6d3] rounded-md tracking-[0.2em] transition-all uppercase text-sm font-semibold shadow-lg"
          >
            ← Back
          </button>

          {!capturedImage ? (
            <button
              onClick={capturePhoto}
              disabled={countdown !== null}
              className="px-8 py-3 bg-[#4a3828] hover:bg-[#5a4838] text-[#f5e6d3] rounded-md tracking-[0.2em] transition-all uppercase text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {countdown !== null ? 'Starting...' : '˗ˏˋClickˎˊ˗'}
            </button>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="px-8 py-3 bg-[#4a3828] hover:bg-[#5a4838] text-[#f5e6d3] rounded-md tracking-[0.2em] transition-all uppercase text-sm font-semibold shadow-lg"
              >
                ⟳ Retake
              </button>
              <button
                onClick={downloadPhoto}
                className="px-8 py-3 bg-[#5a4838] hover:bg-[#6a5848] text-[#f5e6d3] rounded-md tracking-[0.2em] transition-all uppercase text-sm font-semibold shadow-lg"
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

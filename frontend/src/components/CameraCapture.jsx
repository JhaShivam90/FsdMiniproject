import { useEffect, useRef, useState } from 'react';

const IconCamera = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconUpload = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export default function CameraCapture({ onCapture, isDark }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    setError(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access failed", err);
      setError(true);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onCapture(file);
    }
  };

  if (!active || error) {
    return (
      <div className={`p-8 text-center rounded-xl border-2 border-dashed ${
        isDark ? 'border-gray-700 bg-dark-700/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <button 
            type="button"
            onClick={startCamera}
            className="btn-primary py-3 px-6 rounded-full flex items-center gap-2"
          >
            <IconCamera /> Open Camera
          </button>
          
          <div className="text-center relative w-full my-2">
            <hr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
            <span className={`px-2 relative -top-[10px] text-xs ${isDark ? 'bg-dark-700/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>OR</span>
          </div>

          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className={`btn-secondary py-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
          >
            <IconUpload /> Upload from Gallery
          </button>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
        <button
          type="button"
          onClick={capturePhoto}
          className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-4 border-white flex items-center justify-center hover:bg-white/40 shadow-lg transition-all"
          title="Capture"
        >
          <div className="w-12 h-12 rounded-full bg-white opacity-80"></div>
        </button>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-md"
      >
        Upload File
      </button>

      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileUpload}
      />
    </div>
  );
}

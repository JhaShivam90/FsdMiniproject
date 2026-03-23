/**
 * pages/ReportPage.jsx — Form to submit a new garbage complaint
 * Captures: photo upload, GPS coordinates, optional description
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

export default function ReportPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | success | error
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle image file selection + generate preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be under 5MB');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  // Handle drag-and-drop on image area
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Use browser Geolocation API to get GPS coordinates
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setLocationStatus('success');

        // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setAddress(data.display_name || '');
        } catch {
          // Address is optional, silently fail
        }
      },
      (err) => {
        setLocationStatus('error');
        setError('Could not get location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit the complaint form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!image) return setError('Please upload a photo of the garbage');
    if (!location) return setError('Please capture your location first');

    setSubmitting(true);
    try {
      // Use FormData for multipart/form-data (required for file upload)
      const formData = new FormData();
      formData.append('image', image);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('address', address);
      formData.append('description', description);

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center animate-fade-in">
            <div className="text-7xl mb-6">✅</div>
            <h2 className="font-display text-3xl font-bold text-white mb-3">Report Submitted!</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Your garbage complaint has been registered. The municipal team will take action shortly.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                View My Reports
              </button>
              <button
                onClick={() => {
                  setSuccess(false); setImage(null); setPreview(null);
                  setLocation(null); setLocationStatus('idle'); setDescription('');
                }}
                className="btn-secondary"
              >
                Report Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Report Garbage</h1>
          <p className="text-gray-500 mt-1">Upload a photo and share your location to file a complaint</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              ⚠ {error}
            </div>
          )}

          {/* Step 1: Image Upload */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 font-bold text-sm font-mono">1</div>
              <h3 className="font-display font-semibold text-white">Upload Photo</h3>
            </div>

            {preview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-dark-700">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreview(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark-900/80 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
                <div className="absolute bottom-3 left-3 bg-dark-900/70 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-gray-300">
                  📷 {image?.name}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-white/10 hover:border-brand-500/40 rounded-xl p-10 text-center cursor-pointer transition-colors group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</div>
                <p className="text-gray-300 font-medium">Click or drag & drop an image</p>
                <p className="text-gray-600 text-sm mt-1">JPG, PNG, WEBP — max 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Step 2: Location */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 font-bold text-sm font-mono">2</div>
              <h3 className="font-display font-semibold text-white">Capture Location</h3>
            </div>

            {locationStatus === 'success' ? (
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-brand-400 text-xl">📍</span>
                  <div>
                    {address && <p className="text-gray-200 text-sm font-medium">{address}</p>}
                    <p className="text-gray-500 text-xs font-mono mt-1">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setLocation(null); setLocationStatus('idle'); setAddress(''); }}
                    className="ml-auto text-gray-500 hover:text-red-400 transition-colors text-xs"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={captureLocation}
                disabled={locationStatus === 'loading'}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                {locationStatus === 'loading' ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Getting your location...
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    Use My Current Location (GPS)
                  </>
                )}
              </button>
            )}
          </div>

          {/* Step 3: Description */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 font-bold text-sm font-mono">3</div>
              <h3 className="font-display font-semibold text-white">Description <span className="text-gray-600 font-normal text-sm">(optional)</span></h3>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the garbage situation (e.g., large pile near bus stop, overflowing dustbin...)"
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !image || !location}
            className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting complaint...
              </>
            ) : (
              <>🚨 Submit Garbage Report</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

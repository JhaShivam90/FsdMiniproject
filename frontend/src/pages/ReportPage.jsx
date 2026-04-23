/**
 * pages/ReportPage.jsx — Garbage complaint form with light/dark support
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import LocationPickerMap from '../components/LocationPickerMap';
import api from '../utils/api';

// ── Icon components ──────────────────────────────────
const IconCamera = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconPin = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconOffice = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconText = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);
const IconX = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconSpinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);
const IconSuccess = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconUpload = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export default function ReportPage() {
  const { isDark } = useTheme();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState('');
  
  const [authorities, setAuthorities] = useState([]);
  const [authorityId, setAuthorityId] = useState(null);
  const [fetchingAuthorities, setFetchingAuthorities] = useState(false);
  
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      setAddress(data.display_name || '');
    } catch { /* silent */ }
  };

  // Fetch authorities when location is set
  useEffect(() => {
    if (location && locationStatus === 'success') {
      const fetchAuthorities = async () => {
        setFetchingAuthorities(true);
        try {
          const res = await api.get(`/authorities/nearby?lat=${location.latitude}&lng=${location.longitude}`);
          setAuthorities(res.data.authorities);
          // Auto select if only one
          if (res.data.authorities.length > 0) {
            setAuthorityId(res.data.authorities[0]._id);
          } else {
            setAuthorityId(null);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setFetchingAuthorities(false);
        }
      };
      // add small debounce or just run
      fetchAuthorities();
    }
  }, [location, locationStatus]);

  const captureLocation = () => {
    if (!navigator.geolocation) { 
      setError('Geolocation not supported. Please use the map.'); 
      setShowMap(true);
      return; 
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLocation({ latitude, longitude });
        setLocationStatus('success');
        reverseGeocode(latitude, longitude);
        setShowMap(false);
      },
      () => { 
        setLocationStatus('error'); 
        setError('Could not get location. Please select manually on the map.'); 
        setShowMap(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMapLocation = (loc) => {
    setLocation(loc);
    setLocationStatus('success');
    reverseGeocode(loc.latitude, loc.longitude);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!image) return setError('Please upload a photo of the garbage');
    if (!location) return setError('Please capture your GPS location first');
    if (!authorityId) return setError('Please select an authority from the list');

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('image', image);
      fd.append('latitude', location.latitude);
      fd.append('longitude', location.longitude);
      fd.append('address', address);
      fd.append('description', description);
      fd.append('authorityId', authorityId);
      
      await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[82vh] px-4">
          <div className={`text-center max-w-sm mx-auto p-10 rounded-3xl border ${isDark ? 'bg-dark-800 border-white/5' : 'bg-white border-green-100 shadow-xl'}`}>
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6 ${isDark ? 'bg-brand-500/10 text-brand-400' : 'bg-green-50 text-green-500'}`}>
              <IconSuccess />
            </div>
            <h2 className="font-display text-2xl font-bold page-title mb-2">Report Submitted</h2>
            <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Your garbage complaint has been transmitted to the selected authority.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                View My Reports
              </button>
              <button
                onClick={() => {
                  setSuccess(false); setImage(null); setPreview(null);
                  setLocation(null); setLocationStatus('idle'); setShowMap(false);
                  setAddress(''); setDescription(''); setAuthorityId(null); setAuthorities([]);
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

  const StepHeader = ({ num, icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center step-badge text-sm font-bold font-mono`}>
        {num}
      </div>
      <div className={`w-8 h-8 flex items-center justify-center ${isDark ? 'text-brand-400' : 'text-green-600'}`}>
        {icon}
      </div>
      <div>
        <h3 className={`font-display font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
        {subtitle && <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="mb-8">
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-brand-400' : 'text-green-600'} uppercase tracking-widest font-mono`}>
            Complaint Form
          </p>
          <h1 className="font-display text-4xl font-bold page-title">Report Garbage</h1>
          <p className="page-subtitle mt-1 text-sm">
            Upload a photo, pinpoint your location, and select the local authority.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
              isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* ── Step 1: Photo ──────────────────────── */}
          <div className="card border">
            <StepHeader num="1" icon={<IconCamera />} title="Upload Photo" subtitle="JPG, PNG or WEBP — max 5MB" />
            {preview ? (
              <div className={`relative rounded-xl overflow-hidden aspect-video ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreview(null); }}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isDark ? 'bg-dark-900/80 text-gray-300 hover:text-red-400' : 'bg-white/90 text-gray-500 hover:text-red-500 shadow'
                  }`}
                >
                  <IconX />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="drop-zone border-2 border-dashed rounded-xl p-6 transition-all group"
              >
                <p className={`text-center font-medium text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Choose how to provide your photo
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current.click()}
                    className={`flex-1 py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${
                      isDark ? 'bg-dark-700 border-gray-700 hover:border-brand-500 text-brand-400' : 'bg-green-50 border-green-200 hover:border-green-400 text-green-600'
                    }`}
                  >
                    <IconCamera />
                    <span className="text-xs font-bold uppercase tracking-wide mt-1">Take Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current.click()}
                    className={`flex-1 py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${
                      isDark ? 'bg-dark-700 border-gray-700 hover:border-gray-500 text-gray-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <IconUpload />
                    <span className="text-xs font-bold uppercase tracking-wide mt-1">Gallery</span>
                  </button>
                </div>
              </div>
            )}
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
            <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          {/* ── Step 2: Location ───────────────────── */}
          <div className="card border">
            <StepHeader num="2" icon={<IconPin />} title="Capture Location" subtitle="Device GPS or Map Picker" />
            
            {!showMap && locationStatus === 'success' ? (
              <div className={`rounded-xl p-4 ${isDark ? 'bg-brand-500/8 border border-brand-500/15' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-brand-400' : 'text-green-500'}`}>
                    <IconPin />
                  </div>
                  <div className="flex-1 min-w-0">
                    {address && (
                      <p className={`text-sm font-medium leading-snug ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {address}
                      </p>
                    )}
                    <p className={`text-xs font-mono mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setLocation(null); setLocationStatus('idle'); setAddress(''); setAuthorityId(null); setAuthorities([]); }}
                    className={`text-xs font-medium transition-colors flex-shrink-0 ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : showMap ? (
              <div className="space-y-4">
                <LocationPickerMap location={location} setLocation={handleMapLocation} />
                <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Click anywhere on the map to drop a pin.</p>
                <div className="flex justify-between items-center gap-2">
                  <button type="button" onClick={() => setShowMap(false)} className="btn-secondary text-xs px-4 py-2">
                    Close Map
                  </button>
                  {location && (
                    <span className={`text-xs font-mono ${isDark ? 'text-brand-400' : 'text-green-600'}`}>
                      Pin set at {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={locationStatus === 'loading'}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  {locationStatus === 'loading' ? (
                    <><IconSpinner /> Getting your location...</>
                  ) : (
                    <><IconPin /> Use Auto GPS Location</>
                  )}
                </button>
                <div className="text-center relative">
                  <hr className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
                  <span className={`px-2 relative -top-[10px] text-xs ${isDark ? 'bg-dark-800 text-gray-500' : 'bg-white text-gray-400'}`}>OR</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  Wait, pick manually on Map
                </button>
              </div>
            )}
          </div>

          {/* ── Step 3: Select Authority ───────────── */}
          <div className="card border">
            <StepHeader num="3" icon={<IconOffice />} title="Select Target Authority" subtitle="Based on your location" />
            
            {!location ? (
              <p className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Please set your location first to see nearby authorities.
              </p>
            ) : fetchingAuthorities ? (
              <div className="flex items-center gap-2 text-sm text-brand-400">
                <IconSpinner /> Fetching nearest municipal offices...
              </div>
            ) : authorities.length === 0 ? (
              <p className={`text-sm italic ${isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>
                No specific authorities registered nearby. 
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {authorities.map(auth => (
                  <label key={auth._id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    authorityId === auth._id 
                      ? (isDark ? 'bg-brand-500/10 border-brand-500' : 'bg-green-50 border-green-500')
                      : (isDark ? 'bg-dark-700/50 border-white/5 hover:border-gray-600' : 'bg-gray-50 hover:border-gray-300')
                  }`}>
                    <input 
                      type="radio" 
                      name="authority" 
                      className="mt-1"
                      checked={authorityId === auth._id} 
                      onChange={() => setAuthorityId(auth._id)} 
                    />
                    <div>
                      <p className={`font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {auth.authorityDetails?.name || auth.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {auth.authorityDetails?.address}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ── Step 4: Description ────────────────── */}
          <div className="card border">
            <StepHeader
              num="4"
              icon={<IconText />}
              title="Description"
              subtitle="Optional — help the team understand the issue"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the situation — e.g. large pile near the bus stop, overflowing bin..."
              rows={3}
              className="input resize-none text-sm"
            />
          </div>

          {/* ── Completion checklist ───────────────── */}
          <div className={`rounded-xl px-5 py-4 flex items-center gap-4 text-xs font-mono overflow-auto ${
            isDark ? 'bg-dark-700/50' : 'bg-green-50 border border-green-100'
          }`}>
            {[
              { done: !!image,    label: 'Photo' },
              { done: !!location, label: 'Location' },
              { done: !!authorityId, label: 'Authority' },
              { done: true,       label: 'Description' },
            ].map(({ done, label }) => (
              <span key={label} className={`flex whitespace-nowrap items-center gap-1.5 ${
                done
                  ? (isDark ? 'text-brand-400' : 'text-green-600')
                  : (isDark ? 'text-gray-600' : 'text-gray-400')
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${done ? (isDark ? 'bg-brand-400' : 'bg-green-500') : (isDark ? 'bg-gray-600' : 'bg-gray-300')}`} />
                {label}
              </span>
            ))}
          </div>

          {/* ── Submit ─────────────────────────────── */}
          <button
            type="submit"
            disabled={submitting || !image || !location || !authorityId}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
          >
            {submitting ? (
              <><IconSpinner /> Submitting report...</>
            ) : (
              <><IconUpload /> Submit Garbage Report</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
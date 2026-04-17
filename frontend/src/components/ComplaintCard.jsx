/**
 * components/ComplaintCard.jsx — Card showing a single complaint's info
 */

import { useState } from 'react';
import StatusBadge from './StatusBadge';
import api from '../utils/api';

const IconStar = ({ fill = "currentColor", className = "w-5 h-5", onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    className={`cursor-pointer transition-colors ${className}`}
    fill={fill}
    stroke="currentColor"
    viewBox="0 0 24 24"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

export default function ComplaintCard({ complaint, onStatusChange, isAdmin }) {
  const [localRating, setLocalRating] = useState(complaint.rating);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const date = new Date(complaint.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const nextStatus = {
    open: 'assigned', // triggers auto assign truck endpoint
    pending_verification: 'resolved', // triggers verify endpoint
  };

  const nextLabel = {
    open: 'Auto-Assign Truck',
    pending_verification: 'Verify & Resolve',
  };

  const handleRate = async (stars) => {
    if (submittingRating) return;
    setSubmittingRating(true);
    try {
      await api.post(`/authorities/${complaint.authorityId}/rate`, {
        complaintId: complaint._id,
        rating: stars
      });
      setLocalRating(stars);
      setRatingOpen(false);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="card hover:border-brand-700/30 transition-all duration-200 animate-slide-up relative overflow-hidden">
      {/* Image */}
      <div className={`relative mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-700 aspect-video flex`}>
        <div className={`relative h-full ${complaint.afterImageUrl ? 'w-1/2 border-r border-gray-800' : 'w-full'}`}>
          <img
            src={complaint.imageUrl}
            alt="Garbage complaint before"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x225?text=Before+Image+Not+Found'; }}
          />
          {complaint.afterImageUrl && <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1 py-0.5 rounded text-[10px] uppercase font-bold text-white tracking-widest">Before</div>}
        </div>
        {complaint.afterImageUrl && (
          <div className={`relative h-full w-1/2`}>
            <img
              src={complaint.afterImageUrl}
              alt="Garbage complaint after"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x225?text=After+Image+Not+Found'; }}
            />
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1 py-0.5 rounded text-[10px] uppercase font-bold text-white tracking-widest">After</div>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          {localRating && (
            <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm text-yellow-500 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs font-bold border border-yellow-500/20 shadow-sm">
              <IconStar className="w-3 h-3" /> {localRating}
            </div>
          )}
          {/* <StatusBadge status={complaint.status} /> */}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 mt-0.5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            {complaint.location?.address && (
              <p className="text-gray-700 dark:text-gray-300 font-medium">{complaint.location.address}</p>
            )}
            <p className="font-mono text-xs text-gray-400 dark:text-gray-500">
              {complaint.location?.latitude?.toFixed(5)}, {complaint.location?.longitude?.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Progress Stepper Minimal */}
        <div className="relative mt-3 mb-2 px-1">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-200 dark:bg-gray-700 -translate-y-1/2">
            <div className={`h-full bg-green-500 transition-all ${
              complaint.status === 'open' ? 'w-0' :
              complaint.status === 'assigned' ? 'w-1/3' :
              complaint.status === 'pending_verification' ? 'w-2/3' : 'w-full'
            }`}></div>
          </div>
          <div className="flex justify-between items-center relative z-10 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            {[
              { id: 'open', label: 'Reported', val: 0 },
              { id: 'assigned', label: 'Dispatched', val: 1 },
              { id: 'pending_verification', label: 'Cleaned', val: 2 },
              { id: 'resolved', label: 'Verified', val: 3 }
            ].map(step => {
              const currentVal = { open: 0, assigned: 1, pending_verification: 2, resolved: 3 }[complaint.status];
              const isCompleted = currentVal >= step.val;
              const isActive = currentVal === step.val;
              return (
                <div key={step.id} className="flex flex-col items-center gap-1.5 w-12 cursor-default" title={step.label}>
                  <div className={`w-2 h-2 rounded-full transition-all ${
                    isCompleted 
                      ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  {isActive && <span className="absolute -bottom-4 text-green-600 dark:text-green-400 font-bold whitespace-nowrap">{step.label}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        {complaint.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{complaint.description}</p>
        )}

        {/* Assigned Truck Info */}
        {complaint.workerId && complaint.workerId.workerDetails?.truckNumber && (
          <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500 font-mono bg-amber-50 dark:bg-amber-500/10 p-1.5 rounded w-max">
            <span>{complaint.workerId.workerDetails.truckNumber}</span>
          </div>
        )}

        {/* Reporter (admin view) */}
        {isAdmin && complaint.userName && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-700 flex items-center justify-center text-xs dark:text-brand-300 font-bold">
              {complaint.userName[0].toUpperCase()}
            </div>
            <span className="text-gray-600 dark:text-gray-400">{complaint.userName}</span>
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-gray-500 dark:text-gray-600 font-mono">{date}</p>

        {/* Admin action button */}
        {isAdmin && nextStatus[complaint.status] && (
          <button
            onClick={() => onStatusChange(complaint._id, nextStatus[complaint.status])}
            className="mt-3 w-full btn-primary text-sm py-2"
          >
            {nextLabel[complaint.status]}
          </button>
        )}

        {/* User Rate action button */}
        {!isAdmin && complaint.status === 'resolved' && !localRating && !ratingOpen && (
          <button
            onClick={() => setRatingOpen(true)}
            className="mt-3 w-full btn-secondary text-sm py-2 border-brand-200 text-brand-600 hover:bg-brand-50"
          >
            Rate Resolution
          </button>
        )}

        {/* Rating Block */}
        {ratingOpen && (
          <div className="mt-3 p-3 rounded-lg border bg-gray-50 dark:bg-dark-800 dark:border-gray-700 flex flex-col items-center animate-slide-up">
            <p className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">How did the authority do?</p>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => {
                const starVal = i + 1;
                return (
                  <IconStar
                    key={i}
                    fill={starVal <= hoverStar ? 'currentColor' : 'none'}
                    className={`w-7 h-7 ${starVal <= hoverStar ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    onMouseEnter={() => setHoverStar(starVal)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => handleRate(starVal)}
                  />
                )
              })}
            </div>
            <button onClick={() => setRatingOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

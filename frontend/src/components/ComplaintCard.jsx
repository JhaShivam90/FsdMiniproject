/**
 * components/ComplaintCard.jsx — Card showing a single complaint's info
 */

import StatusBadge from './StatusBadge';

export default function ComplaintCard({ complaint, onStatusChange, isAdmin }) {
  const date = new Date(complaint.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const nextStatus = {
    open: 'assigned',
    assigned: 'resolved',
    resolved: null,
  };

  const nextLabel = {
    open: '🚛 Assign Truck',
    assigned: '✓ Mark Resolved',
  };

  return (
    <div className="card hover:border-brand-700/30 transition-all duration-200 animate-slide-up">
      {/* Image */}
      <div className="relative mb-4 rounded-xl overflow-hidden bg-dark-700 aspect-video">
        <img
          src={complaint.imageUrl}
          alt="Garbage complaint"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x225?text=Image+Not+Found';
          }}
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4 mt-0.5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            {complaint.location?.address && (
              <p className="text-gray-300 font-medium">{complaint.location.address}</p>
            )}
            <p className="font-mono text-xs text-gray-500">
              {complaint.location?.latitude?.toFixed(5)}, {complaint.location?.longitude?.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Description */}
        {complaint.description && (
          <p className="text-sm text-gray-400 line-clamp-2">{complaint.description}</p>
        )}

        {/* Reporter (admin view) */}
        {isAdmin && complaint.userName && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center text-xs text-brand-300 font-bold">
              {complaint.userName[0].toUpperCase()}
            </div>
            <span className="text-gray-400">{complaint.userName}</span>
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-gray-600 font-mono">{date}</p>

        {/* Admin action button */}
        {isAdmin && nextStatus[complaint.status] && (
          <button
            onClick={() => onStatusChange(complaint._id, nextStatus[complaint.status])}
            className="mt-3 w-full btn-primary text-sm py-2"
          >
            {nextLabel[complaint.status]}
          </button>
        )}
      </div>
    </div>
  );
}

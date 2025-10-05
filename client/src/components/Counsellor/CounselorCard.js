import React from 'react';
import './styles/CounselorCard.css';

const CounselorCard = ({ counselor, onBook }) => {
  const handleBookClick = () => {
    if (counselor.available) {
      onBook(counselor.id);
    }
  };

  return (
    <div className={`counselor-card ${!counselor.available ? 'unavailable' : ''}`}>
      <div className="counselor-header">
        <img src={counselor.image} alt={counselor.name} className="counselor-avatar" />
        <div className="counselor-basic-info">
          <h3 className="counselor-name">{counselor.name}</h3>
          <p className="counselor-specialty">{counselor.specialty}</p>
          <div className="rating">
            <span className="stars">⭐ {counselor.rating}</span>
            <span className="reviews">({counselor.reviews} reviews)</span>
          </div>
        </div>
        <div className="availability-badge">
          {counselor.available ? (
            <span className="available">Available</span>
          ) : (
            <span className="offline">Offline</span>
          )}
        </div>
      </div>

      <div className="counselor-details">
        <p className="counselor-description">{counselor.description}</p>
        
        <div className="counselor-meta">
          <div className="meta-item">
            <span className="meta-label">Experience:</span>
            <span className="meta-value">{counselor.experience} years</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Languages:</span>
            <span className="meta-value">{counselor.languages.join(', ')}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Next Available:</span>
            <span className="meta-value">{counselor.nextAvailable}</span>
          </div>
        </div>

        <div className="counselor-footer">
          <div className="price-section">
            <span className="price">${counselor.price}</span>
            <span className="session">/ session</span>
          </div>
          <button 
            className={`book-button ${counselor.available ? 'available' : 'unavailable'}`}
            onClick={handleBookClick}
            disabled={!counselor.available}
          >
            {counselor.available ? 'Book Session' : 'Not Available'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounselorCard;
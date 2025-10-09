import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { specialties } from '../../utils/mockData';
import { counsellorService } from '../../services/api';
import CounselorCard from './CounselorCard';
import BookingModal from '../Booking/BookingModal';
import PaymentModal from '../Payment/PaymentModal';
import './styles/FindCounselors.css';

const FindCounselors = () => {
  const navigate = useNavigate();
  const [counselors, setCounselors] = useState([]);
  const [filteredCounselors, setFilteredCounselors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(null);

  // Load counselors from API
  useEffect(() => {
    loadCounselors(); // THIS WAS MISSING!
  }, []);

  const loadCounselors = async () => {
    try {
      setLoading(true);
      const response = await counsellorService.getAll();
      if (response.data.success) {
        setCounselors(response.data.data);
        setFilteredCounselors(response.data.data);
      } else {
        console.error('API returned success: false', response.data);
        alert('Failed to load counselors. Please try again.');
      }
    } catch (error) {
      console.error('Failed to load counselors:', error);
      alert('Failed to load counselors. Please check your connection and try again.');
      // Don't fall back to mock data - keep empty array
      setCounselors([]);
      setFilteredCounselors([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let results = counselors;

    if (searchTerm) {
      results = results.filter(counselor =>
        counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counselor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counselor.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'All Specialties') {
      results = results.filter(counselor => counselor.specialty === selectedSpecialty);
    }

    if (availabilityFilter === 'Available Now') {
      results = results.filter(counselor => counselor.available);
    }

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    setFilteredCounselors(results);
  }, [counselors, searchTerm, selectedSpecialty, availabilityFilter, sortBy]);

  const handleBookSession = (counselorId) => {
    const counselor = counselors.find(c => c.id === counselorId);
    if (counselor.available) {
      setSelectedCounselor(counselor);
      setIsBookingModalOpen(true);
    }
  };

  const handleConfirmBooking = async (bookingData) => {
    try {
      // Save booking to backend
      // const response = await apiService.bookings.create(bookingData);
      // const savedBooking = response.data.booking;
      
      // For now, simulate saved booking
      const savedBooking = {
        ...bookingData,
        id: 'book_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };

      setPendingBooking(savedBooking);
      setIsBookingModalOpen(false);
      setIsPaymentModalOpen(true);
      
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Update booking status in backend
      // await apiService.bookings.update(pendingBooking.id, { status: 'confirmed' });
      
      alert(`Booking confirmed!\n\nSession with ${pendingBooking.counselorName}\nDate: ${pendingBooking.date}\nTime: ${pendingBooking.time}\nPayment ID: ${paymentResult.paymentId}`);
      
      // Close modals and reset
      setIsPaymentModalOpen(false);
      setSelectedCounselor(null);
      setPendingBooking(null);
      
      // Navigate to sessions page
      navigate('/my-sessions');
      
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      alert('Booking confirmed but failed to update status. Please contact support.');
    }
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setIsPaymentModalOpen(false);
    setSelectedCounselor(null);
    setPendingBooking(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('All Specialties');
    setAvailabilityFilter('All');
    setSortBy('rating');
  };

  if (loading) {
    return (
      <div className="find-counselors">
        <div className="loading-container">
          <h2>Loading counselors...</h2>
          <p>Please wait while we fetch the available professionals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="find-counselors">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/client-dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Find Your Perfect Counselor</h1>
        <p>Connect with certified mental health professionals</p>
      </header>

      {/* Search and Filters Section */}
      <div className="search-filters-section">
        <div className="search-bar">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, specialty, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="clear-filters" onClick={clearFilters}>
            Clear All
          </button>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Specialty:</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="filter-select"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Availability:</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Counselors</option>
              <option value="Available Now">Available Now</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          <span className="results-count">
            {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? 's' : ''} found
          </span>
          <span className="available-now">
            {filteredCounselors.filter(c => c.available).length} available now
          </span>
        </div>
      </div>

      {/* Counselors Grid */}
      <div className="counselors-grid">
        {filteredCounselors.length > 0 ? (
          <div className="counselors-list">
            {filteredCounselors.map(counselor => (
              <CounselorCard
                key={counselor.id}
                counselor={counselor}
                onBook={handleBookSession}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No counselors found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button className="cta-button" onClick={clearFilters}>
              Show All Counselors
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedCounselor && (
        <BookingModal
          counselor={selectedCounselor}
          isOpen={isBookingModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBooking}
        />
      )}

      {/* Payment Modal */}
      {pendingBooking && (
        <PaymentModal
          booking={pendingBooking}
          isOpen={isPaymentModalOpen}
          onClose={handleCloseModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default FindCounselors;
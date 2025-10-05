import React, { useState } from 'react';
import './styles/PaymentModal.css';

const PaymentModal = ({ booking, isOpen, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    // Format card number with spaces
    if (field === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }
    
    // Format expiry date
    if (field === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }
    
    // Format CVV
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call your payment API
      // await apiService.payments.confirmPayment({
      //   bookingId: booking.id,
      //   paymentMethod,
      //   cardDetails
      // });

      onPaymentSuccess({
        bookingId: booking.id,
        paymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
        amount: booking.price,
        status: 'completed'
      });
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={handleOverlayClick}>
      <div className="payment-modal">
        <div className="modal-header">
          <h2>Complete Your Booking</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span>Counselor:</span>
              <span>{booking.counselorName}</span>
            </div>
            <div className="summary-item">
              <span>Date & Time:</span>
              <span>{booking.date} at {booking.time}</span>
            </div>
            <div className="summary-item">
              <span>Session Type:</span>
              <span>{booking.type}</span>
            </div>
            <div className="summary-total">
              <span>Total Amount:</span>
              <span>${booking.price}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="payment-methods">
            <label className="payment-method">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💳 Credit/Debit Card</span>
            </label>
            
            <label className="payment-method">
              <input
                type="radio"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💰 PayPal</span>
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="card-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => handleCardInputChange('number', e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="paypal-section">
              <p>You will be redirected to PayPal to complete your payment.</p>
              <button type="button" className="paypal-button">
                Continue with PayPal
              </button>
            </div>
          )}

          <div className="security-notice">
            <div className="lock-icon">🔒</div>
            <span>Your payment information is secure and encrypted</span>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="pay-button"
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                `Pay $${booking.price}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
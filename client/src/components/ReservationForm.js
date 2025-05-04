// src/components/ReservationForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReservationForm = ({ workspace, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    couponCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [error, setError] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [priceDetails, setPriceDetails] = useState({
    hours: 0,
    basePrice: 0,
    discountPercent: 0,
    discountAmount: 0,
    couponDiscount: 0,
    finalPrice: 0
  });

  // Отримати купони користувача
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        const response = await axios.get('http://localhost:5000/api/reservations/user/coupons', config);
        setCoupons(response.data);
      } catch (err) {
        console.error('Error fetching coupons:', err);
      } finally {
        setLoadingCoupons(false);
      }
    };
    
    fetchCoupons();
  }, []);

  // Функція для обчислення ціни з урахуванням знижок
  const calculatePrice = () => {
    const { startTime, endTime, couponCode } = formData;
    
    if (!startTime || !endTime) return;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Розрахунок тривалості в годинах
    const durationHours = Math.max(0, (end - start) / (1000 * 60 * 60));
    
    // Базова вартість
    const basePrice = workspace.pricePerHour * durationHours;
    
    // Визначення знижки залежно від тривалості
    let discountPercent = 0;
    
    // Робочий день (8 годин)
    if (durationHours >= 8 && durationHours < 24 * 30) {
      discountPercent = workspace.discounts?.day || 10;
    } 
    // Місяць (30 днів)
    else if (durationHours >= 24 * 30 && durationHours < 24 * 365) {
      discountPercent = workspace.discounts?.month || 20;
    } 
    // Рік
    else if (durationHours >= 24 * 365) {
      discountPercent = workspace.discounts?.year || 30;
    }
    
    // Розрахунок знижки
    const discountAmount = basePrice * (discountPercent / 100);
    let priceAfterDiscount = basePrice - discountAmount;
    
    // Застосувати купон, якщо вибрано
    let couponDiscount = 0;
    if (couponCode) {
      const selectedCoupon = coupons.find(c => c.code === couponCode);
      if (selectedCoupon) {
        couponDiscount = priceAfterDiscount * (selectedCoupon.discountPercent / 100);
        priceAfterDiscount -= couponDiscount;
      }
    }
    
    setPriceDetails({
      hours: parseFloat(durationHours.toFixed(1)),
      basePrice: parseFloat(basePrice.toFixed(2)),
      discountPercent,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      couponDiscount: parseFloat(couponDiscount.toFixed(2)),
      finalPrice: parseFloat(priceAfterDiscount.toFixed(2))
    });
  };

  useEffect(() => {
    calculatePrice();
  }, [formData, workspace, coupons]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { startTime, endTime, couponCode } = formData;
      
      // Базова валідація
      if (!startTime || !endTime) {
        setError('Please select both start and end times');
        setLoading(false);
        return;
      }

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      
      if (startDate >= endDate) {
        setError('End time must be after start time');
        setLoading(false);
        return;
      }

      // Створити бронювання
      const reservationData = {
        workspaceId: workspace._id,
        startTime,
        endTime,
        couponCode: couponCode || undefined
      };

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      const response = await axios.post(
        'http://localhost:5000/api/reservations',
        reservationData,
        config
      );
      
      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current date and time for min values
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
  const currentDateTime = `${currentDate}T${currentTime}`;

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Reserve {workspace.name}</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="startTime" className="form-label">Start Time</label>
            <input
              type="datetime-local"
              className="form-control"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              min={currentDateTime}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="endTime" className="form-label">End Time</label>
            <input
              type="datetime-local"
              className="form-control"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              min={formData.startTime || currentDateTime}
              required
            />
          </div>
          
          {coupons.length > 0 && (
            <div className="mb-3">
              <label htmlFor="couponCode" className="form-label">Apply Coupon (Optional)</label>
              <select
                className="form-select"
                id="couponCode"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
              >
                <option value="">No coupon</option>
                {coupons.map(coupon => (
                  <option key={coupon.code} value={coupon.code}>
                    {coupon.code} - {coupon.discountPercent}% off (expires {new Date(coupon.expiryDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="price-details mb-4 p-3 bg-light rounded">
            <h6 className="mb-3">Reservation Details</h6>
            
            <div className="d-flex justify-content-between mb-2">
              <span>Workspace Type:</span>
              <span>{workspace.type.replace('_', ' ')}</span>
            </div>
            
            <div className="d-flex justify-content-between mb-2">
              <span>Base Price:</span>
              <span>${workspace.pricePerHour}/hour</span>
            </div>
            
            {priceDetails.hours > 0 && (
              <>
                <div className="d-flex justify-content-between mb-2">
                  <span>Duration:</span>
                  <span>{priceDetails.hours} hours</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${priceDetails.basePrice}</span>
                </div>
                
                {priceDetails.discountPercent > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Duration Discount ({priceDetails.discountPercent}%):</span>
                    <span>-${priceDetails.discountAmount}</span>
                  </div>
                )}
                
                {priceDetails.couponDiscount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Coupon Discount:</span>
                    <span>-${priceDetails.couponDiscount}</span>
                  </div>
                )}
                
                <hr/>
                
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total:</span>
                  <span>${priceDetails.finalPrice}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="d-flex justify-content-between">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;
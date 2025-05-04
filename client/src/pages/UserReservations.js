// src/pages/UserReservations.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getUserReservations, cancelReservation } from '../services/api';
import axios from 'axios';
import UserCoupons from '../components/UserCoupons';

const UserReservations = () => {
  const location = useLocation();
  const [reservations, setReservations] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    location.state?.success ? 'Reservation created successfully!' : ''
  );
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch reservations
        const reservationsData = await getUserReservations();
        setReservations(reservationsData);
        
        // Fetch coupons
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        const couponsResponse = await axios.get(
          'http://localhost:5000/api/reservations/user/coupons',
          config
        );
        
        setCoupons(couponsResponse.data);
        setError('');
      } catch (err) {
        setError('Failed to load your data. Please try again later.');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await cancelReservation(id);
      
      // Update the local state
      setReservations(reservations.map(reservation => 
        reservation._id === id 
          ? { ...reservation, status: 'cancelled' } 
          : reservation
      ));
      
      setSuccessMessage('Reservation cancelled successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Refresh coupons (in case a coupon was refunded)
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      
      const couponsResponse = await axios.get(
        'http://localhost:5000/api/reservations/user/coupons',
        config
      );
      
      setCoupons(couponsResponse.data);
    } catch (err) {
      setError('Failed to cancel the reservation. Please try again.');
      console.error('Error cancelling reservation:', err);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Group reservations by status
  const upcomingReservations = reservations.filter(r => 
    r.status === 'confirmed' && new Date(r.startTime) > new Date()
  );
  
  const pastReservations = reservations.filter(r => 
    r.status === 'confirmed' && new Date(r.startTime) <= new Date()
  );
  
  const cancelledReservations = reservations.filter(r => 
    r.status === 'cancelled'
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Account</h2>
      
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Reservations
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Reservations
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            My Coupons
          </button>
        </li>
      </ul>
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Upcoming Reservations */}
          {activeTab === 'upcoming' && (
            <>
              <h4 className="mb-3">Upcoming Reservations</h4>
              {upcomingReservations.length > 0 ? (
                <div className="list-group mb-4">
                  {upcomingReservations.map(reservation => (
                    <div key={reservation._id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{reservation.workspace.name}</h5>
                        <small>
                          <span className="badge bg-success">Confirmed</span>
                        </small>
                      </div>
                      <p className="mb-1">
                        <strong>Location:</strong> {reservation.workspace.coworking.name}, {reservation.workspace.coworking.address}
                      </p>
                      <p className="mb-1">
                        <strong>Type:</strong> {reservation.workspace.type.replace('_', ' ')}
                      </p>
                      <p className="mb-1">
                        <strong>Time:</strong> {formatDate(reservation.startTime)} - {formatDate(reservation.endTime)}
                      </p>
                      <p className="mb-1">
                        <strong>Total Cost:</strong> ${reservation.totalPrice}
                        {reservation.discountApplied > 0 && (
                          <span className="text-success"> (includes {reservation.discountApplied}% duration discount)</span>
                        )}
                        {reservation.couponCode && (
                          <span className="text-success"> (coupon applied: {reservation.couponCode})</span>
                        )}
                      </p>
                      <button 
                        className="btn btn-danger btn-sm mt-2" 
                        onClick={() => handleCancelReservation(reservation._id)}
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info mb-4">No upcoming reservations.</div>
              )}
            </>
          )}
          
          {/* Past Reservations */}
          {activeTab === 'past' && (
            <>
              <h4 className="mb-3">Past Reservations</h4>
              {pastReservations.length > 0 ? (
                <div className="list-group mb-4">
                  {pastReservations.map(reservation => (
                    <div key={reservation._id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{reservation.workspace.name}</h5>
                        <small>
                          <span className="badge bg-secondary">Completed</span>
                        </small>
                      </div>
                      <p className="mb-1">
                        <strong>Location:</strong> {reservation.workspace.coworking.name}, {reservation.workspace.coworking.address}
                      </p>
                      <p className="mb-1">
                        <strong>Type:</strong> {reservation.workspace.type.replace('_', ' ')}
                      </p>
                      <p className="mb-1">
                        <strong>Time:</strong> {formatDate(reservation.startTime)} - {formatDate(reservation.endTime)}
                      </p>
                      <p className="mb-1">
                        <strong>Total Cost:</strong> ${reservation.totalPrice}
                        {reservation.discountApplied > 0 && (
                          <span className="text-success"> (included {reservation.discountApplied}% duration discount)</span>
                        )}
                        {reservation.couponCode && (
                          <span className="text-success"> (coupon applied: {reservation.couponCode})</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info mb-4">No past reservations.</div>
              )}
            </>
          )}
          
          {/* Cancelled Reservations */}
          {activeTab === 'cancelled' && (
            <>
              <h4 className="mb-3">Cancelled Reservations</h4>
              {cancelledReservations.length > 0 ? (
                <div className="list-group mb-4">
                  {cancelledReservations.map(reservation => (
                    <div key={reservation._id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{reservation.workspace.name}</h5>
                        <small>
                          <span className="badge bg-danger">Cancelled</span>
                        </small>
                      </div>
                      <p className="mb-1">
                        <strong>Location:</strong> {reservation.workspace.coworking.name}, {reservation.workspace.coworking.address}
                      </p>
                      <p className="mb-1">
                        <strong>Type:</strong> {reservation.workspace.type.replace('_', ' ')}
                      </p>
                      <p className="mb-1">
                        <strong>Time:</strong> {formatDate(reservation.startTime)} - {formatDate(reservation.endTime)}
                      </p>
                      <p className="mb-1">
                        <strong>Total Cost:</strong> ${reservation.totalPrice}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info mb-4">No cancelled reservations.</div>
              )}
            </>
          )}
          
          {/* Coupons */}
          {activeTab === 'coupons' && (
            <UserCoupons coupons={coupons} />
          )}
        </>
      )}
    </div>
  );
};

export default UserReservations;
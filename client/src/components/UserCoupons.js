// src/components/UserCoupons.js
import React from 'react';

const UserCoupons = ({ coupons }) => {
  if (!coupons || coupons.length === 0) {
    return (
      <div className="alert alert-info">
        You don't have any active coupons. Make more reservations to earn discounts!
      </div>
    );
  }

  return (
    <div>
      <h5 className="mb-3">Your Discount Coupons</h5>
      <div className="row">
        {coupons.map(coupon => (
          <div className="col-md-6 col-lg-4 mb-3" key={coupon.code}>
            <div className="card border-primary">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span>{coupon.discountPercent}% OFF</span>
                <small className="text-light">CODE: {coupon.code}</small>
              </div>
              <div className="card-body">
                <p className="card-text mb-0">Apply this coupon to any reservation to get {coupon.discountPercent}% off.</p>
                <small className="text-muted">Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserCoupons;
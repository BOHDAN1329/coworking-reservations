// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>CoworkSpot</h5>
            <p className="text-muted">
              Find and book the perfect workspace in coworking spaces around the city.
            </p>
          </div>
          
          <div className="col-md-2 mb-3 mb-md-0">
            <h5>Navigation</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
              <li><Link to="/coworkings" className="text-decoration-none text-muted">Coworkings</Link></li>
              <li><Link to="/reservations" className="text-decoration-none text-muted">Reservations</Link></li>
            </ul>
          </div>
          
          <div className="col-md-3 mb-3 mb-md-0">
            <h5>Account</h5>
            <ul className="list-unstyled">
              <li><Link to="/login" className="text-decoration-none text-muted">Login</Link></li>
              <li><Link to="/register" className="text-decoration-none text-muted">Register</Link></li>
            </ul>
          </div>
          
          <div className="col-md-3">
            <h5>Contact</h5>
            <ul className="list-unstyled">
              <li className="text-muted">Email: info@coworkspot.com</li>
              <li className="text-muted">Phone: +1 234 567 8900</li>
            </ul>
          </div>
        </div>
        
        <hr className="my-3" />
        
        <div className="text-center">
          <p className="mb-0 text-muted">© 2025 CoworkSpot - All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
// src/pages/Home.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getCoworkings } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import CoworkingCard from '../components/CoworkingCard';

const Home = () => {
  const [featuredCoworkings, setFeaturedCoworkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCoworkings = async () => {
      try {
        const data = await getCoworkings();
        // Get first 3 coworkings as featured
        setFeaturedCoworkings(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching coworkings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoworkings();
  }, []);

  return (
    <div className="container mt-4">
      <div className="jumbotron p-4 bg-light rounded-3 mb-4">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">Find Your Perfect Workspace</h1>
          <p className="col-md-8 fs-4">
            Book desks, meeting rooms, and offices in coworking spaces around the city.
            Flexible booking options for hours, days, or months.
          </p>
          <Link to="/coworkings" className="btn btn-primary btn-lg">
            Browse Coworking Spaces
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-outline-primary btn-lg ms-2">
              Sign Up
            </Link>
          )}
        </div>
      </div>

      <h2 className="mb-4">Featured Coworking Spaces</h2>
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : featuredCoworkings.length > 0 ? (
        <div className="row">
          {featuredCoworkings.map(coworking => (
            <div key={coworking._id} className="col-md-4">
              <CoworkingCard coworking={coworking} />
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">No coworking spaces available yet.</div>
      )}

      <div className="text-center mt-4">
        <Link to="/coworkings" className="btn btn-outline-primary">
          View All Coworking Spaces
        </Link>
      </div>

      <hr className="my-5" />

      <div className="row mt-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3 className="card-title">
                <i className="bi bi-search me-2"></i>
                Find
              </h3>
              <p className="card-text">
                Search for coworking spaces by location, amenities, and availability.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3 className="card-title">
                <i className="bi bi-calendar2-check me-2"></i>
                Book
              </h3>
              <p className="card-text">
                Reserve your workspace instantly with our easy-to-use booking system.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h3 className="card-title">
                <i className="bi bi-laptop me-2"></i>
                Work
              </h3>
              <p className="card-text">
                Enjoy a productive workspace designed for comfort and efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
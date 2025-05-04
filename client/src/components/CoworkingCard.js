// src/components/CoworkingCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const CoworkingCard = ({ coworking }) => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">{coworking.name}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{coworking.address}</h6>
        <p className="card-text">
          {coworking.description.length > 150 
            ? `${coworking.description.substring(0, 150)}...` 
            : coworking.description}
        </p>
        <div className="mb-3">
          <strong>Facilities:</strong> 
          <div className="d-flex flex-wrap mt-1">
            {coworking.facilities && coworking.facilities.map(facility => (
              <span key={facility} className="badge bg-light text-dark me-1 mb-1">
                {facility.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Hours: {coworking.openingHours.from} - {coworking.openingHours.to}
          </small>
          <Link to={`/coworking/${coworking._id}`} className="btn btn-primary">
            View Spaces
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CoworkingCard;
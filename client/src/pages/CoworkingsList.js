import React, { useState, useEffect } from 'react';
import { getCoworkings } from '../services/api';
import CoworkingCard from '../components/CoworkingCard';

const CoworkingsList = () => {
  const [coworkings, setCoworkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const facilities = [
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'free_snacks', label: 'Free Snacks' },
    { id: 'parking', label: 'Parking' }
  ];

  useEffect(() => {
    const fetchCoworkings = async () => {
      try {
        const data = await getCoworkings();
        setCoworkings(data);
        setError('');
      } catch (err) {
        setError('Failed to load coworking spaces. Please try again later.');
        console.error('Error fetching coworkings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoworkings();
  }, []);

  const handleFacilityChange = (facilityId) => {
    if (selectedFacilities.includes(facilityId)) {
      setSelectedFacilities(selectedFacilities.filter(id => id !== facilityId));
    } else {
      setSelectedFacilities([...selectedFacilities, facilityId]);
    }
  };

  const filteredCoworkings = coworkings.filter(coworking => {
    // Filter by search term
    const matchesSearch = coworking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coworking.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by selected facilities
    const matchesFacilities = selectedFacilities.length === 0 ||
                             selectedFacilities.every(facility => 
                               coworking.facilities && coworking.facilities.includes(facility)
                             );
    
    return matchesSearch && matchesFacilities;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Coworking Spaces</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </button>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="d-flex flex-wrap align-items-center">
            <span className="me-2">Facilities:</span>
            {facilities.map(facility => (
              <div key={facility.id} className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`facility-${facility.id}`}
                  checked={selectedFacilities.includes(facility.id)}
                  onChange={() => handleFacilityChange(facility.id)}
                />
                <label className="form-check-label" htmlFor={`facility-${facility.id}`}>
                  {facility.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredCoworkings.length > 0 ? (
        <div className="row">
          {filteredCoworkings.map(coworking => (
            <div key={coworking._id} className="col-md-6">
              <CoworkingCard coworking={coworking} />
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          No coworking spaces found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default CoworkingsList;
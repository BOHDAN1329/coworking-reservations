import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoworkingForm = ({ coworking, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    facilities: [],
    parkingSpaces: {
      total: 0,
      available: 0
    },
    maxCapacity: 0,
    currentOccupancy: 0,
    openingHours: {
      from: '08:00',
      to: '20:00'
    },
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Заповнюємо форму даними, якщо редагуємо існуючий коворкінг
  useEffect(() => {
    if (coworking) {
      setFormData({
        name: coworking.name || '',
        address: coworking.address || '',
        description: coworking.description || '',
        facilities: coworking.facilities || [],
        parkingSpaces: coworking.parkingSpaces || { total: 0, available: 0 },
        maxCapacity: coworking.maxCapacity || 0,
        currentOccupancy: coworking.currentOccupancy || 0,
        openingHours: {
          from: coworking.openingHours?.from || '08:00',
          to: coworking.openingHours?.to || '20:00'
        },
        images: coworking.images || []
      });
    }
  }, [coworking]);

  const facilitiesOptions = [
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'free_snacks', label: 'Free Snacks' },
    { id: 'parking', label: 'Parking' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleParkingChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      parkingSpaces: {
        ...formData.parkingSpaces,
        [name]: parseInt(value) || 0
      }
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    });
  };

  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, value]
      });
    } else {
      setFormData({
        ...formData,
        facilities: formData.facilities.filter(facility => facility !== value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        withCredentials: true
      };

      let response;
      
      // Вибираємо між створенням та оновленням
      if (coworking) {
        response = await axios.put(
          `http://localhost:5000/api/coworkings/${coworking._id}`, 
          formData,
          config
        );
      } else {
        response = await axios.post(
          'http://localhost:5000/api/coworkings', 
          formData,
          config
        );
      }

      setLoading(false);
      onSuccess(response.data);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Failed to save coworking space');
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          {coworking ? 'Edit Coworking Space' : 'Add New Coworking Space'}
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Facilities</label>
            <div>
              {facilitiesOptions.map(facility => (
                <div className="form-check form-check-inline" key={facility.id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`facility-${facility.id}`}
                    value={facility.id}
                    checked={formData.facilities.includes(facility.id)}
                    onChange={handleFacilityChange}
                  />
                  <label className="form-check-label" htmlFor={`facility-${facility.id}`}>
                    {facility.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Parking spaces */}
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="parkingTotal" className="form-label">Total Parking Spaces</label>
              <input
                type="number"
                className="form-control"
                id="parkingTotal"
                name="total"
                min="0"
                value={formData.parkingSpaces.total}
                onChange={handleParkingChange}
              />
            </div>
            <div className="col">
              <label htmlFor="parkingAvailable" className="form-label">Available Parking Spaces</label>
              <input
                type="number"
                className="form-control"
                id="parkingAvailable"
                name="available"
                min="0"
                max={formData.parkingSpaces.total}
                value={formData.parkingSpaces.available}
                onChange={handleParkingChange}
              />
            </div>
          </div>
          
          {/* Capacity */}
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="maxCapacity" className="form-label">Maximum Capacity (people)</label>
              <input
                type="number"
                className="form-control"
                id="maxCapacity"
                name="maxCapacity"
                min="0"
                value={formData.maxCapacity}
                onChange={handleNumberChange}
              />
            </div>
            <div className="col">
              <label htmlFor="currentOccupancy" className="form-label">Current Occupancy (people)</label>
              <input
                type="number"
                className="form-control"
                id="currentOccupancy"
                name="currentOccupancy"
                min="0"
                max={formData.maxCapacity}
                value={formData.currentOccupancy}
                onChange={handleNumberChange}
              />
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="openingHoursFrom" className="form-label">Opening Time</label>
              <input
                type="time"
                className="form-control"
                id="openingHoursFrom"
                name="openingHours.from"
                value={formData.openingHours.from}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <label htmlFor="openingHoursTo" className="form-label">Closing Time</label>
              <input
                type="time"
                className="form-control"
                id="openingHoursTo"
                name="openingHours.to"
                value={formData.openingHours.to}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="d-flex justify-content-between">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (coworking ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoworkingForm;
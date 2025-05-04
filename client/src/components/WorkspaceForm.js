// src/components/WorkspaceForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkspaceForm = ({ workspace, coworkings, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    coworking: '',
    type: 'desk',
    pricePerHour: 10,
    capacity: 1,
    available: true,
    position: { x: 0, y: 0 },
    discounts: {
      day: 10,
      month: 20,
      year: 30
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Заповнюємо форму даними, якщо редагуємо існуючий workspace
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || '',
        coworking: workspace.coworking._id || workspace.coworking,
        type: workspace.type || 'desk',
        pricePerHour: workspace.pricePerHour || 10,
        capacity: workspace.capacity || 1,
        available: workspace.available !== undefined ? workspace.available : true,
        position: workspace.position || { x: 0, y: 0 },
        discounts: workspace.discounts || {
          day: 10,
          month: 20,
          year: 30
        }
      });
    } else if (coworkings.length > 0) {
      // Встановлюємо значення за замовчуванням для нового робочого місця
      setFormData(prevState => ({
        ...prevState,
        coworking: coworkings[0]._id
      }));
    }
  }, [workspace, coworkings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'pricePerHour' || name === 'capacity') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      discounts: {
        ...formData.discounts,
        [name]: parseInt(value)
      }
    });
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
        }
      };

      // Підготуємо дані для відправки
      const workspaceData = {
        ...formData,
        coworkingId: formData.coworking // API очікує coworkingId, а не coworking
      };

      let response;
      
      // Вибираємо між створенням та оновленням
      if (workspace) {
        response = await axios.put(
          `http://localhost:5000/api/workspaces/${workspace._id}`, 
          workspaceData,
          config
        );
      } else {
        response = await axios.post(
          'http://localhost:5000/api/workspaces', 
          workspaceData,
          config
        );
      }

      setLoading(false);
      onSuccess(response.data);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Failed to save workspace');
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          {workspace ? 'Edit Workspace' : 'Add New Workspace'}
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
            <label htmlFor="coworking" className="form-label">Coworking Space</label>
            <select
              className="form-select"
              id="coworking"
              name="coworking"
              value={formData.coworking}
              onChange={handleChange}
              required
            >
              <option value="">Select Coworking Space</option>
              {coworkings.map(coworking => (
                <option key={coworking._id} value={coworking._id}>
                  {coworking.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="type" className="form-label">Type</label>
            <select
              className="form-select"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="desk">Desk</option>
              <option value="office">Private Office</option>
              <option value="meeting_room">Meeting Room</option>
            </select>
          </div>
          
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="pricePerHour" className="form-label">Price per Hour ($)</label>
              <input
                type="number"
                className="form-control"
                id="pricePerHour"
                name="pricePerHour"
                min="0"
                step="0.01"
                value={formData.pricePerHour}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="col">
              <label htmlFor="capacity" className="form-label">Capacity (people)</label>
              <input
                type="number"
                className="form-control"
                id="capacity"
                name="capacity"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          {/* Discount settings */}
          <h6 className="mt-4 mb-3">Discount Settings</h6>
          
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="dayDiscount" className="form-label">Day discount (%)</label>
              <input
                type="number"
                className="form-control"
                id="dayDiscount"
                name="day"
                min="0"
                max="100"
                value={formData.discounts.day}
                onChange={handleDiscountChange}
                required
              />
              <small className="text-muted">Applied for 8+ hours</small>
            </div>
            
            <div className="col">
              <label htmlFor="monthDiscount" className="form-label">Month discount (%)</label>
              <input
                type="number"
                className="form-control"
                id="monthDiscount"
                name="month"
                min="0"
                max="100"
                value={formData.discounts.month}
                onChange={handleDiscountChange}
                required
              />
              <small className="text-muted">Applied for 30+ days</small>
            </div>
            
            <div className="col">
              <label htmlFor="yearDiscount" className="form-label">Year discount (%)</label>
              <input
                type="number"
                className="form-control"
                id="yearDiscount"
                name="year"
                min="0"
                max="100"
                value={formData.discounts.year}
                onChange={handleDiscountChange}
                required
              />
              <small className="text-muted">Applied for 365+ days</small>
            </div>
          </div>
          
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="available"
              name="available"
              checked={formData.available}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="available">
              Available for booking
            </label>
          </div>
          
          <div className="d-flex justify-content-between">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (workspace ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceForm;
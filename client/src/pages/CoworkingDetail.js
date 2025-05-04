// src/pages/CoworkingDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCoworking, getWorkspacesByCoworking } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import WorkspaceCard from '../components/WorkspaceCard';
import ReservationForm from '../components/ReservationForm';
import CoworkingMap from '../components/CoworkingMap';

const CoworkingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [coworking, setCoworking] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch coworking details
        const coworkingData = await getCoworking(id);
        setCoworking(coworkingData);
        
        // Fetch workspaces for this coworking
        const workspacesData = await getWorkspacesByCoworking(id);
        setWorkspaces(workspacesData);
        
        setError('');
      } catch (err) {
        setError('Failed to load coworking details. Please try again later.');
        console.error('Error fetching coworking details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleWorkspaceSelect = (workspace) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setSelectedWorkspace(workspace);
    setShowReservationForm(true);
  };

  const handleReservationSuccess = () => {
    setShowReservationForm(false);
    // Refresh workspaces to update availability
    getWorkspacesByCoworking(id)
      .then(data => setWorkspaces(data))
      .catch(err => console.error('Error refreshing workspaces:', err));
    
    // Show success message or redirect to reservations
    navigate('/reservations', { state: { success: true } });
  };

  const filteredWorkspaces = selectedType === 'all' 
    ? workspaces 
    : workspaces.filter(workspace => workspace.type === selectedType);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!coworking) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          Coworking space not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <h2>{coworking.name}</h2>
          <p className="lead">{coworking.address}</p>
          
          <div className="mb-4">
            <h5>Description</h5>
            <p>{coworking.description}</p>
          </div>
          
          <div className="mb-4">
            <h5>Facilities</h5>
            <div className="d-flex flex-wrap">
              {coworking.facilities && coworking.facilities.map(facility => (
                <span key={facility} className="badge bg-light text-dark me-2 mb-2 p-2">
                  <i className={`bi bi-${getFacilityIcon(facility)} me-1`}></i>
                  {facility.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h5>Opening Hours</h5>
            <p><i className="bi bi-clock me-2"></i>{coworking.openingHours.from} - {coworking.openingHours.to}</p>
          </div>
          
          <hr className="my-4" />
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Available Workspaces</h3>
            
            <div className="btn-group">
              <button 
                type="button" 
                className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('map')}
              >
                <i className="bi bi-grid me-1"></i> Map View
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
              >
                <i className="bi bi-list me-1"></i> List View
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="btn-group" role="group">
              <button 
                type="button" 
                className={`btn ${selectedType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedType('all')}
              >
                All
              </button>
              <button 
                type="button" 
                className={`btn ${selectedType === 'desk' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedType('desk')}
              >
                Desks
              </button>
              <button 
                type="button" 
                className={`btn ${selectedType === 'office' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedType('office')}
              >
                Offices
              </button>
              <button 
                type="button" 
                className={`btn ${selectedType === 'meeting_room' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedType('meeting_room')}
              >
                Meeting Rooms
              </button>
            </div>
          </div>
          
          {filteredWorkspaces.length > 0 ? (
            <>
              {viewMode === 'map' ? (
                <CoworkingMap 
                  workspaces={filteredWorkspaces} 
                  onSelectWorkspace={handleWorkspaceSelect} 
                />
              ) : (
                filteredWorkspaces.map(workspace => (
                  <WorkspaceCard 
                    key={workspace._id} 
                    workspace={workspace}
                    onSelect={handleWorkspaceSelect}
                  />
                ))
              )}
            </>
          ) : (
            <div className="alert alert-info">
              No {selectedType !== 'all' ? selectedType.replace('_', ' ') : 'workspace'} available.
            </div>
          )}
        </div>
        
        <div className="col-md-4">
          {showReservationForm && selectedWorkspace ? (
            <ReservationForm 
              workspace={selectedWorkspace}
              onSuccess={handleReservationSuccess}
              onCancel={() => setShowReservationForm(false)}
            />
          ) : selectedWorkspace ? (
            <div className="card sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Selected Workspace</h5>
              </div>
              <div className="card-body">
                <h5>{selectedWorkspace.name}</h5>
                <p><strong>Type:</strong> {selectedWorkspace.type.replace('_', ' ')}</p>
                <p><strong>Price:</strong> ${selectedWorkspace.pricePerHour}/hour</p>
                <p><strong>Capacity:</strong> {selectedWorkspace.capacity} {selectedWorkspace.capacity === 1 ? 'person' : 'people'}</p>
                <button 
                  className="btn btn-primary w-100"
                  onClick={() => setShowReservationForm(true)}
                >
                  Reserve Now
                </button>
              </div>
            </div>
          ) : (
            <div className="card sticky-top" style={{ top: '20px' }}>
              <div className="card-body">
                <h5 className="card-title">How to Reserve</h5>
                <ol className="card-text">
                  <li>Choose your workspace type</li>
                  <li>Select an available workspace</li>
                  <li>Pick your date and time</li>
                  <li>Confirm your reservation</li>
                </ol>
                <p className="card-text">
                  {isAuthenticated ? (
                    <>Click on a workspace to book it.</>
                  ) : (
                    <>
                      Please <a href="/login">login</a> to make a reservation.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get icon for facility
const getFacilityIcon = (facility) => {
  const icons = {
    wifi: 'wifi',
    coffee: 'cup-hot',
    printer: 'printer',
    meeting_room: 'people',
    parking: 'car-front',
    lockers: 'box'
  };
  
  return icons[facility] || 'check-circle';
};

export default CoworkingDetail;
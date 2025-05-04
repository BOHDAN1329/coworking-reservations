// src/pages/AdminDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CoworkingForm from '../components/CoworkingForm';
import WorkspaceForm from '../components/WorkspaceForm';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [coworkings, setCoworkings] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('coworkings');
  
  // Відображення коворкінгів
  const [selectedCoworking, setSelectedCoworking] = useState(null);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([]);
  const [workspaceType, setWorkspaceType] = useState('all');
  
  // Пошук
  const [searchTerm, setSearchTerm] = useState('');
  
  // Форми
  const [showCoworkingForm, setShowCoworkingForm] = useState(false);
  const [editingCoworking, setEditingCoworking] = useState(null);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const API_URL = 'http://localhost:5000/api';
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        // Fetch all required data
        const [coworkingsRes, reservationsRes, workspacesRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/coworkings`, config),
          axios.get(`${API_URL}/reservations`, config),
          axios.get(`${API_URL}/workspaces`, config),
          axios.get(`${API_URL}/auth/users`, config)
        ]);
        
        setCoworkings(coworkingsRes.data);
        setReservations(reservationsRes.data);
        setWorkspaces(workspacesRes.data);
        setUsers(usersRes.data);
        
        setError('');
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // При виборі коворкінгу, фільтруємо робочі місця
  useEffect(() => {
    if (selectedCoworking) {
      const spacesForCoworking = workspaces.filter(
        workspace => workspace.coworking._id === selectedCoworking || workspace.coworking === selectedCoworking
      );
      setFilteredWorkspaces(spacesForCoworking);
    } else {
      setFilteredWorkspaces([]);
    }
  }, [selectedCoworking, workspaces]);

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

  // ====== Функції для управління коворкінгами ======
  const handleDeleteCoworking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coworking space?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/coworkings/${id}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Update state after deletion
      setCoworkings(coworkings.filter(coworking => coworking._id !== id));
      if (selectedCoworking === id) {
        setSelectedCoworking(null);
      }
    } catch (err) {
      setError('Failed to delete coworking space');
      console.error('Error deleting coworking:', err);
    }
  };

  const handleEditCoworking = (coworking) => {
    setEditingCoworking(coworking);
    setShowCoworkingForm(true);
  };

  const handleCoworkingSuccess = (updatedCoworking) => {
    if (editingCoworking) {
      // Update existing coworking
      setCoworkings(
        coworkings.map(coworking => 
          coworking._id === updatedCoworking._id ? updatedCoworking : coworking
        )
      );
    } else {
      // Add new coworking
      setCoworkings([updatedCoworking, ...coworkings]);
    }
    
    setShowCoworkingForm(false);
    setEditingCoworking(null);
  };

  // ====== Функції для управління робочими місцями ======
  const handleDeleteWorkspace = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workspace?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/workspaces/${id}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Оновлюємо стан після видалення
      setWorkspaces(workspaces.filter(workspace => workspace._id !== id));
      setFilteredWorkspaces(filteredWorkspaces.filter(workspace => workspace._id !== id));
    } catch (err) {
      setError('Failed to delete workspace');
      console.error('Error deleting workspace:', err);
    }
  };

  const handleEditWorkspace = (workspace) => {
    setEditingWorkspace(workspace);
    setShowWorkspaceForm(true);
  };

  const handleWorkspaceSuccess = (updatedWorkspace) => {
    if (editingWorkspace) {
      // Оновлюємо існуючий workspace
      const updatedWorkspaces = workspaces.map(workspace => 
        workspace._id === updatedWorkspace._id ? updatedWorkspace : workspace
      );
      setWorkspaces(updatedWorkspaces);
      
      // Також оновлюємо фільтровані робочі місця, якщо потрібно
      if (selectedCoworking) {
        setFilteredWorkspaces(
          updatedWorkspaces.filter(
            w => w.coworking._id === selectedCoworking || w.coworking === selectedCoworking
          )
        );
      }
    } else {
      // Додаємо новий workspace
      const newWorkspaces = [updatedWorkspace, ...workspaces];
      setWorkspaces(newWorkspaces);
      
      // Також оновлюємо фільтровані робочі місця, якщо це для поточного коворкінгу
      if (selectedCoworking && 
          (updatedWorkspace.coworking === selectedCoworking || 
           updatedWorkspace.coworking._id === selectedCoworking)) {
        setFilteredWorkspaces([updatedWorkspace, ...filteredWorkspaces]);
      }
    }
    
    setShowWorkspaceForm(false);
    setEditingWorkspace(null);
  };

  // ====== Функція для скасування бронювання ======
  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/reservations/${id}/cancel`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Оновлюємо стан після скасування
      setReservations(
        reservations.map(reservation => 
          reservation._id === id 
            ? { ...reservation, status: 'cancelled' } 
            : reservation
        )
      );
    } catch (err) {
      setError('Failed to cancel reservation');
      console.error('Error cancelling reservation:', err);
    }
  };

  // ====== Функції для управління користувачами ======
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const response = await axios.put(
        `http://localhost:5000/api/auth/users/${userId}/role`,
        { role: newRole },
        config
      );
      
      // Оновлюємо список користувачів
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
    } catch (err) {
      setError('Failed to update user role');
      console.error('Error updating user role:', err);
    }
  };

  const getFilteredWorkspacesByType = () => {
    if (workspaceType === 'all') {
      return filteredWorkspaces;
    }
    return filteredWorkspaces.filter(workspace => workspace.type === workspaceType);
  };

  // Фільтрація за пошуковим запитом
  const getFilteredCoworkings = () => {
    if (!searchTerm) return coworkings;
    
    return coworkings.filter(
      c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredUsers = () => {
    if (!searchTerm) return users;
    
    return users.filter(
      u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredReservations = () => {
    if (!searchTerm) return reservations;
    
    return reservations.filter(r => {
      // Перевіряємо, чи включає ім'я користувача, назву робочого місця або назву коворкінгу
      const userName = r.user && typeof r.user === 'object' ? r.user.name.toLowerCase() : '';
      const workspaceName = r.workspace && typeof r.workspace === 'object' 
        ? r.workspace.name.toLowerCase() : '';
      const coworkingName = r.workspace && r.workspace.coworking && typeof r.workspace.coworking === 'object'
        ? r.workspace.coworking.name.toLowerCase() : '';
      
      return userName.includes(searchTerm.toLowerCase()) ||
             workspaceName.includes(searchTerm.toLowerCase()) ||
             coworkingName.includes(searchTerm.toLowerCase());
    });
  };

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
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'coworkings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('coworkings');
              setSelectedCoworking(null);
              setSearchTerm('');
            }}
          >
            Coworkings
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'workspaces' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('workspaces');
              setSearchTerm('');
            }}
          >
            Workspaces
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('reservations');
              setSearchTerm('');
            }}
          >
            Reservations
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('users');
              setSearchTerm('');
            }}
          >
            Users
          </button>
        </li>
      </ul>
      
      {/* Пошук і фільтри */}
      <div className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Coworkings Tab */}
      {activeTab === 'coworkings' && (
        <div>
          {showCoworkingForm ? (
            <CoworkingForm 
              coworking={editingCoworking}
              onSuccess={handleCoworkingSuccess}
              onCancel={() => {
                setShowCoworkingForm(false);
                setEditingCoworking(null);
              }}
            />
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Coworking Spaces ({getFilteredCoworkings().length})</h4>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCoworkingForm(true)}
                >
                  Add New Coworking
                </button>
              </div>
              
              {getFilteredCoworkings().length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Facilities</th>
                        <th>Opening Hours</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredCoworkings().map(coworking => (
                        <tr key={coworking._id}>
                          <td>
                            <a 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedCoworking(coworking._id);
                                setActiveTab('workspaces');
                              }}
                            >
                              {coworking.name}
                            </a>
                          </td>
                          <td>{coworking.address}</td>
                          <td>
                            {coworking.facilities && coworking.facilities.map(facility => (
                              <span key={facility} className="badge bg-light text-dark me-1">
                                {facility.replace('_', ' ')}
                              </span>
                            ))}
                          </td>
                          <td>
                            {coworking.openingHours ? 
                              `${coworking.openingHours.from} - ${coworking.openingHours.to}` : 
                              'Not specified'}
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEditCoworking(coworking)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteCoworking(coworking._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">No coworking spaces available yet.</div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Workspaces Tab */}
      {activeTab === 'workspaces' && (
        <div>
          {selectedCoworking ? (
            // Відображення робочих місць для вибраного коворкінгу
            <>
              {showWorkspaceForm ? (
                <WorkspaceForm 
                  workspace={editingWorkspace}
                  coworkings={selectedCoworking ? 
                    coworkings.filter(c => c._id === selectedCoworking) : 
                    coworkings}
                  onSuccess={handleWorkspaceSuccess}
                  onCancel={() => {
                    setShowWorkspaceForm(false);
                    setEditingWorkspace(null);
                  }}
                />
              ) : (
                <>
                  <div className="d-flex align-items-center mb-3">
                    <button 
                      className="btn btn-sm btn-outline-secondary me-3"
                      onClick={() => setSelectedCoworking(null)}
                    >
                      &larr; Back to All Coworkings
                    </button>
                    
                    <h4 className="mb-0">
                      {coworkings.find(c => c._id === selectedCoworking)?.name || 'Coworking'} - Workspaces
                    </h4>
                    
                    <div className="ms-auto">
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          setEditingWorkspace(null);
                          setShowWorkspaceForm(true);
                        }}
                      >
                        Add New Workspace
                      </button>
                    </div>
                  </div>
                  
                  {/* Фільтр за типом робочого місця */}
                  <div className="mb-3">
                    <div className="btn-group" role="group">
                      <button 
                        type="button" 
                        className={`btn ${workspaceType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setWorkspaceType('all')}
                      >
                        All
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${workspaceType === 'desk' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setWorkspaceType('desk')}
                      >
                        Desks
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${workspaceType === 'office' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setWorkspaceType('office')}
                      >
                        Offices
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${workspaceType === 'meeting_room' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setWorkspaceType('meeting_room')}
                      >
                        Meeting Rooms
                      </button>
                    </div>
                  </div>
                  
                  {getFilteredWorkspacesByType().length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Price/Hour</th>
                            <th>Capacity</th>
                            <th>Available</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredWorkspacesByType().map(workspace => (
                            <tr key={workspace._id}>
                              <td>{workspace.name}</td>
                              <td>{workspace.type ? workspace.type.replace('_', ' ') : 'Unknown'}</td>
                              <td>${workspace.pricePerHour}</td>
                              <td>{workspace.capacity}</td>
                              <td>
                                <span className={`badge ${workspace.available ? 'bg-success' : 'bg-danger'}`}>
                                  {workspace.available ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleEditWorkspace(workspace)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteWorkspace(workspace._id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      No workspaces available for this coworking yet. Add some using the button above.
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // Відображення списку коворкінгів для вибору
            <>
              <h4 className="mb-3">Select a Coworking Space</h4>
              {coworkings.length > 0 ? (
                <div className="list-group">
                  {coworkings.map(coworking => (
                    <a 
                      key={coworking._id}
                      href="#"
                      className="list-group-item list-group-item-action"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedCoworking(coworking._id);
                      }}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{coworking.name}</h5>
                        <span className="badge bg-primary rounded-pill">
                          {workspaces.filter(w => w.coworking._id === coworking._id || w.coworking === coworking._id).length} workspaces
                        </span>
                      </div>
                      <p className="mb-1">{coworking.address}</p>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  No coworking spaces available yet. Please add some in the Coworkings tab.
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div>
          <h4 className="mb-3">All Reservations ({getFilteredReservations().length})</h4>
          
          {getFilteredReservations().length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Workspace</th>
                    <th>Coworking</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredReservations().map(reservation => (
                    <tr key={reservation._id}>
                      <td>
                        {reservation.user && typeof reservation.user === 'object' 
                          ? reservation.user.name 
                          : 'Unknown user'}
                      </td>
                      <td>
                        {reservation.workspace && typeof reservation.workspace === 'object' 
                          ? reservation.workspace.name 
                          : 'Unknown workspace'}
                      </td>
                      <td>
                        {reservation.workspace && 
                         reservation.workspace.coworking && 
                         typeof reservation.workspace.coworking === 'object'
                          ? reservation.workspace.coworking.name 
                          : 'Unknown coworking'}
                      </td>
                      <td>{formatDate(reservation.startTime)}</td>
                      <td>{formatDate(reservation.endTime)}</td>
                      <td>
                        <span className={`badge ${
                          reservation.status === 'confirmed' ? 'bg-success' : 
                          reservation.status === 'cancelled' ? 'bg-danger' : 'bg-warning'
                        }`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td>
                      {reservation.status === 'confirmed' && (
                         <button 
                           className="btn btn-sm btn-outline-danger"
                           onClick={() => handleCancelReservation(reservation._id)}
                         >
                           Cancel
                         </button>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
           <div className="alert alert-info">No reservations available yet.</div>
         )}
       </div>
     )}
     
     {/* Users Tab */}
     {activeTab === 'users' && (
       <div>
         <h4 className="mb-3">Users Management ({getFilteredUsers().length})</h4>
         
         {getFilteredUsers().length > 0 ? (
           <div className="table-responsive">
             <table className="table table-striped">
               <thead>
                 <tr>
                   <th>Name</th>
                   <th>Email</th>
                   <th>Role</th>
                   <th>Registered</th>
                   <th>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {getFilteredUsers().map(user => (
                   <tr key={user._id}>
                     <td>{user.name}</td>
                     <td>{user.email}</td>
                     <td>
                       <select 
                         className="form-select form-select-sm"
                         value={user.role}
                         onChange={(e) => handleChangeUserRole(user._id, e.target.value)}
                       >
                         <option value="user">User</option>
                         <option value="admin">Admin</option>
                       </select>
                     </td>
                     <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                     <td>
                       <button 
                         className="btn btn-sm btn-outline-primary"
                         onClick={() => {
                           // Перегляд резервацій користувача
                           setActiveTab('reservations');
                           setSearchTerm(user.name);
                         }}
                       >
                         View Reservations
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
           <div className="alert alert-info">No users found.</div>
         )}
       </div>
     )}
   </div>
 );
};

export default AdminDashboard;
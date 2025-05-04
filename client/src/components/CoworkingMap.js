// src/components/CoworkingMap.js
import React, { useState } from 'react';

const CoworkingMap = ({ workspaces, onSelectWorkspace }) => {
  const [selectedId, setSelectedId] = useState(null);

  // Групуємо робочі місця за типом для кращої організації
  const desks = workspaces.filter(w => w.type === 'desk');
  const offices = workspaces.filter(w => w.type === 'office');
  const meetingRooms = workspaces.filter(w => w.type === 'meeting_room');

  // Обробник вибору робочого місця
  const handleSelect = (workspace) => {
    if (!workspace.available) return;
    
    setSelectedId(workspace._id);
    onSelectWorkspace(workspace);
  };

  // Отримуємо CSS клас на основі статусу доступності
  const getWorkspaceClass = (workspace) => {
    let baseClass = 'workspace-item';
    
    if (workspace._id === selectedId) {
      baseClass += ' selected';
    }
    
    if (!workspace.available) {
      baseClass += ' unavailable';
    }
    
    return baseClass;
  };

  return (
    <div className="coworking-map">
      <div className="map-container p-3 border rounded bg-light mb-4">
        <h5 className="mb-3">Floor Plan</h5>
        
        <div className="workspace-sections">
          {/* Desks Section */}
          <div className="workspace-section mb-4">
            <h6>Desks</h6>
            <div className="d-flex flex-wrap">
              {desks.map(desk => (
                <div 
                  key={desk._id}
                  className={getWorkspaceClass(desk)}
                  onClick={() => handleSelect(desk)}
                  style={{ 
                    cursor: desk.available ? 'pointer' : 'not-allowed',
                    opacity: desk.available ? 1 : 0.6
                  }}
                >
                  <div className="workspace-icon desk-icon">
                    <i className="bi bi-laptop"></i>
                  </div>
                  <div className="workspace-label">{desk.name}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Private Offices Section */}
          {offices.length > 0 && (
            <div className="workspace-section mb-4">
              <h6>Private Offices</h6>
              <div className="d-flex flex-wrap">
                {offices.map(office => (
                  <div 
                    key={office._id}
                    className={getWorkspaceClass(office)}
                    onClick={() => handleSelect(office)}
                    style={{ 
                      cursor: office.available ? 'pointer' : 'not-allowed',
                      opacity: office.available ? 1 : 0.6
                    }}
                  >
                    <div className="workspace-icon office-icon">
                      <i className="bi bi-building"></i>
                    </div>
                    <div className="workspace-label">{office.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Meeting Rooms Section */}
          {meetingRooms.length > 0 && (
            <div className="workspace-section">
              <h6>Meeting Rooms</h6>
              <div className="d-flex flex-wrap">
                {meetingRooms.map(room => (
                  <div 
                    key={room._id}
                    className={getWorkspaceClass(room)}
                    onClick={() => handleSelect(room)}
                    style={{ 
                      cursor: room.available ? 'pointer' : 'not-allowed',
                      opacity: room.available ? 1 : 0.6
                    }}
                  >
                    <div className="workspace-icon meeting-room-icon">
                      <i className="bi bi-people"></i>
                    </div>
                    <div className="workspace-label">{room.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="legend mt-4">
          <div className="d-flex align-items-center mb-1">
            <div className="legend-color available me-2"></div>
            <span>Available</span>
          </div>
          <div className="d-flex align-items-center mb-1">
            <div className="legend-color unavailable me-2"></div>
            <span>Unavailable</span>
          </div>
          <div className="d-flex align-items-center">
            <div className="legend-color selected me-2"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
      
      {/* Додамо трохи CSS безпосередньо в компонент */}
      <style jsx="true">{`
        .workspace-item {
          width: 120px;
          height: 90px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin: 8px;
          padding: 12px;
          text-align: center;
          background-color: #f8f9fa;
          transition: all 0.2s;
        }
        
        .workspace-item:hover {
          box-shadow: 0 0 8px rgba(0,123,255,0.5);
        }
        
        .workspace-item.selected {
          border-color: #0d6efd;
          background-color: rgba(13, 110, 253, 0.1);
          box-shadow: 0 0 8px rgba(0,123,255,0.5);
        }
        
        .workspace-item.unavailable {
          background-color: #f5f5f5;
          border-color: #ddd;
        }
        
        .workspace-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .workspace-label {
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 3px;
          border: 1px solid #ddd;
        }
        
        .legend-color.available {
          background-color: #f8f9fa;
        }
        
        .legend-color.unavailable {
          background-color: #f5f5f5;
          opacity: 0.6;
        }
        
        .legend-color.selected {
          background-color: rgba(13, 110, 253, 0.1);
          border-color: #0d6efd;
        }
      `}</style>
    </div>
  );
};

export default CoworkingMap;
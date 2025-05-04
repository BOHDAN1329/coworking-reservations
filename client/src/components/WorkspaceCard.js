// src/components/WorkspaceCard.js
import React from 'react';

const WorkspaceCard = ({ workspace, onSelect }) => {
  const getTypeLabel = (type) => {
    switch (type) {
      case 'desk':
        return 'Desk';
      case 'office':
        return 'Private Office';
      case 'meeting_room':
        return 'Meeting Room';
      default:
        return type;
    }
  };

  return (
    <div 
      className={`card mb-3 ${!workspace.available ? 'bg-light' : ''}`}
      style={{ opacity: workspace.available ? 1 : 0.7 }}
    >
      <div className="card-body">
        <h5 className="card-title">{workspace.name}</h5>
        <h6 className="card-subtitle mb-2 text-muted">
          {getTypeLabel(workspace.type)}
        </h6>
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <p className="mb-0">
              <strong>Price:</strong> ${workspace.pricePerHour}/hour
            </p>
            {workspace.capacity > 1 && (
              <p className="mb-0">
                <strong>Capacity:</strong> {workspace.capacity} {workspace.capacity === 1 ? 'person' : 'people'}
              </p>
            )}
          </div>
          
          <button 
            className="btn btn-primary" 
            disabled={!workspace.available}
            onClick={() => onSelect(workspace)}
          >
            {workspace.available ? 'Reserve' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;
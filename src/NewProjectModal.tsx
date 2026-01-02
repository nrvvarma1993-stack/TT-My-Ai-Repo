
import { useState } from 'react';
import './Modal.css';

interface Project {
  id: number;
  name: string;
  description: string;
  team: string;
  status: string;
  priority: string;
  ahtImpact?: number;
  costSaving?: number;
  qualityImpact?: number;
}

interface NewProjectModalProps {
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'>) => void;
}

function NewProjectModal({ onClose, onSave }: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    team: '',
    status: 'Not Started',
    priority: 'Medium',
    ahtImpact: 0,
    costSaving: 0,
    qualityImpact: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ahtImpact' || name === 'costSaving' || name === 'qualityImpact' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Team *</label>
            <select
              name="team"
              value={formData.team}
              onChange={handleChange}
              required
            >
              <option value="">Select Team</option>
              <option value="Engineering">Engineering</option>
              <option value="Data Science">Data Science</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewProjectModal;


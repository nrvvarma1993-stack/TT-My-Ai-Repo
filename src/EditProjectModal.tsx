
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

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => void;
}

function EditProjectModal({ project, onClose, onSave }: EditProjectModalProps) {
  const [formData, setFormData] = useState<Project>(project);

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
        <h2>Edit Project</h2>
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
            <label>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority *</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {formData.status === "Completed" && (
            <>
              <div className="form-group">
                <label>AHT Impact (%)</label>
                <input
                  type="number"
                  name="ahtImpact"
                  value={formData.ahtImpact || ''}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Cost Saving ($)</label>
                <input
                  type="number"
                  name="costSaving"
                  value={formData.costSaving || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Quality Impact (%)</label>
                <input
                  type="number"
                  name="qualityImpact"
                  value={formData.qualityImpact || ''}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProjectModal;


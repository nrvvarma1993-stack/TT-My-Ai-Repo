
import { useState, useEffect } from 'react';
import './App.css';

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

interface TeamStats {
  totalProjects: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  ahtImpact: number;
  costSaving: number;
  qualityImpact: number;
}

function App() {
  // Filter state
  const [filters, setFilters] = useState({
    team: '',
    status: '',
    priority: ''
  });
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "AI Chatbot Implementation",
      description: "Develop an AI-powered chatbot for customer support",
      team: "Gopi",
      status: "In Progress",
      priority: "High"
    },
    {
      id: 2,
      name: "Predictive Analytics Dashboard",
      description: "Create a dashboard for predictive analytics",
      team: "Vineetha",
      status: "Completed",
      priority: "Medium",
      ahtImpact: 15.5,
      costSaving: 50000,
      qualityImpact: 12.3
    },
    {
      id: 3,
      name: "Automated Quality Checks",
      description: "Implement automated quality assurance system",
      team: "Sunil",
      status: "Not Started",
      priority: "High"
    }
  ]);

  // Form data for modals
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    team: '',
    status: 'Not Started',
    priority: 'Medium',
    ahtImpact: 0,
    costSaving: 0,
    qualityImpact: 0
  });

  // Filtered projects state
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  // Calculate team stats from projects
  const calculateTeamStats = (projectList: Project[]): Record<string, TeamStats> => {
    const stats: Record<string, TeamStats> = {};
    projectList.forEach(project => {
      if (!stats[project.team]) {
        stats[project.team] = {
          totalProjects: 0,
          notStarted: 0,
          inProgress: 0,
          completed: 0,
          ahtImpact: 0,
          costSaving: 0,
          qualityImpact: 0
        };
      }
      
      const teamStat = stats[project.team];
      teamStat.totalProjects++;
      
      if (project.status === "Not Started") teamStat.notStarted++;
      if (project.status === "In Progress") teamStat.inProgress++;
      if (project.status === "Completed") {
        teamStat.completed++;
        teamStat.ahtImpact += project.ahtImpact || 0;
        teamStat.costSaving += project.costSaving || 0;
        teamStat.qualityImpact += project.qualityImpact || 0;
      }
    });
    return stats;
  };

  const teamStats = calculateTeamStats(projects);
  const filteredTeamStats = calculateTeamStats(filteredProjects);

  // Apply filters whenever filters or projects change
  useEffect(() => {
    let filtered = [...projects];

    if (filters.team) {
      filtered = filtered.filter(project => project.team === filters.team);
    }
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(project => project.priority === filters.priority);
    }

    setFilteredProjects(filtered);
  }, [filters, projects]);

  // Filter handler
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      team: '',
      status: '',
      priority: ''
    });
  };

  // Edit handler
  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData(project);
    setShowEditModal(true);
  };

  // New project handler
  const handleNewProject = () => {
    setFormData({
      name: '',
      description: '',
      team: '',
      status: 'Not Started',
      priority: 'Medium',
      ahtImpact: 0,
      costSaving: 0,
      qualityImpact: 0
    });
    setShowNewModal(true);
  };

  // Form change handler
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ahtImpact' || name === 'costSaving' || name === 'qualityImpact' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  // Save edited project
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProject) {
      setProjects(prev => 
        prev.map(p => p.id === selectedProject.id ? { ...formData, id: selectedProject.id } as Project : p)
      );
      setShowEditModal(false);
    }
  };

  // Save new project
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject = { ...formData, id: Date.now() } as Project;
    setProjects(prev => [...prev, newProject]);
    setShowNewModal(false);
  };

  return (
    <div className="App">
      {/* Header with Action Buttons */}
      <div className="header">
        <h1>AI Project Tracker</h1>
        <div className="header-actions">
          <button className="btn-logout">Logout</button>
          <button className="btn-import">Import Excel</button>
          <button className="btn-new-project" onClick={handleNewProject}>
            + New Project
          </button>
          <button className="btn-export">Export</button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters">
        <h3>Filters:</h3>
        <select
          value={filters.team}
          onChange={(e) => handleFilterChange('team', e.target.value)}
        >
          <option value="">All Teams</option>
          {Object.keys(teamStats).map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <button className="btn-clear-filters" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Team Progress Overview Table */}
      <div className="table-container">
        <h2>Team Progress Overview</h2>
        <table className="progress-table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Total Projects</th>
              <th>Not Started</th>
              <th>In Progress</th>
              <th>Completed</th>
              <th>AHT Impact</th>
              <th>Cost Saving</th>
              <th>Quality Impact</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(filteredTeamStats).map(([team, stats]) => {
              const progress = stats.totalProjects > 0 
                ? ((stats.completed / stats.totalProjects) * 100).toFixed(0) 
                : 0;
              return (
                <tr key={team}>
                  <td>{team}</td>
                  <td>{stats.totalProjects}</td>
                  <td>{stats.notStarted}</td>
                  <td>{stats.inProgress}</td>
                  <td>{stats.completed}</td>
                  <td>{stats.ahtImpact.toFixed(1)}%</td>
                  <td>${stats.costSaving.toLocaleString()}</td>
                  <td>{stats.qualityImpact.toFixed(1)}%</td>
                  <td>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${progress}%` }}
                      ></div>
                      <span className="progress-text">{progress}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Projects Section */}
      <div className="projects-section">
        <h2>AI Projects ({filteredProjects.length})</h2>
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`badge badge-${project.status?.toLowerCase().replace(' ', '-')}`}>
                  {project.status}
                </span>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-meta">
                <span className="project-team">Team: {project.team}</span>
                <span className="project-priority">Priority: {project.priority}</span>
              </div>
              
              <button 
                className="btn-edit-project"
                onClick={() => handleEdit(project)}
              >
                Edit Project
              </button>

              {project.status === "Completed" && (
                <div className="project-metrics">
                  <div className="metric-item">
                    <span className="metric-label">AHT Impact:</span>
                    <span className="metric-value">{project.ahtImpact}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Cost Saving:</span>
                    <span className="metric-value">${project.costSaving?.toLocaleString()}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Quality Impact:</span>
                    <span className="metric-value">{project.qualityImpact}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Project</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleFormChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Team *</label>
                <select
                  name="team"
                  value={formData.team || ''}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Team</option>
                  <option value="Gopi">Gopi</option>
                  <option value="Vineetha">Vineetha</option>
                  <option value="Sunil">Sunil</option>
                  <option value="Arman">Arman</option>
                  <option value="Naveen">Naveen</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleFormChange}
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
                  value={formData.priority || ''}
                  onChange={handleFormChange}
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
                      onChange={handleFormChange}
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Cost Saving ($)</label>
                    <input
                      type="number"
                      name="costSaving"
                      value={formData.costSaving || ''}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Quality Impact (%)</label>
                    <input
                      type="number"
                      name="qualityImpact"
                      value={formData.qualityImpact || ''}
                      onChange={handleFormChange}
                      step="0.1"
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleSaveNew}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleFormChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Team *</label>
                <select
                  name="team"
                  value={formData.team || ''}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Team</option>
                  <option value="Gopi">Gopi</option>
                  <option value="Vineetha">Vineetha</option>
                  <option value="Sunil">Sunil</option>
                  <option value="Arman">Arman</option>
                  <option value="Naveen">Naveen</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleFormChange}
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
                  value={formData.priority || ''}
                  onChange={handleFormChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;



import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import type { Schema } from '../amplify/data/resource';
import './App.css';

const client = generateClient<Schema>();

interface Project {
  id: string;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('Checking...');

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

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      console.log('✅ Authenticated user:', user.username);
      console.log('✅ Auth tokens:', session.tokens ? 'Valid' : 'Missing');
      setAuthStatus(`Logged in as: ${user.username}`);
      return true;
    } catch (error) {
      console.error('❌ Authentication error:', error);
      setAuthStatus('Not authenticated');
      return false;
    }
  };

  // Fetch all projects from backend
  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching projects from backend...');
      const { data, errors } = await client.models.Project.list();
      
      if (errors) {
        console.error('❌ Fetch errors:', errors);
        return;
      }

      console.log('✅ Fetched projects:', data.length);
      setProjects(data as Project[]);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      alert('Failed to load projects. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Initial setup: Check auth and load projects with real-time subscriptions
  useEffect(() => {
    const initializeApp = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        await fetchProjects();
      }
    };

    initializeApp();

    // Set up real-time subscriptions
    console.log('🔌 Setting up real-time subscriptions...');

    // Subscribe to new projects
    const createSub = client.models.Project.onCreate().subscribe({
      next: (data) => {
        console.log('🆕 New project created:', data);
        setProjects((prev) => [...prev, data as Project]);
      },
      error: (error) => console.error('❌ Create subscription error:', error)
    });

    // Subscribe to project updates
    const updateSub = client.models.Project.onUpdate().subscribe({
      next: (data) => {
        console.log('✏️ Project updated:', data);
        setProjects((prev) =>
          prev.map((project) => (project.id === data.id ? data as Project : project))
        );
      },
      error: (error) => console.error('❌ Update subscription error:', error)
    });

    // Subscribe to project deletions
    const deleteSub = client.models.Project.onDelete().subscribe({
      next: (data) => {
        console.log('🗑️ Project deleted:', data);
        setProjects((prev) => prev.filter((project) => project.id !== data.id));
      },
      error: (error) => console.error('❌ Delete subscription error:', error)
    });

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔌 Cleaning up subscriptions...');
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, []);

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

  // Save edited project with auto-refresh
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setLoading(true);
      console.log('✏️ Updating project:', selectedProject.id);
      
      const { data, errors } = await client.models.Project.update({
        id: selectedProject.id,
        name: formData.name,
        description: formData.description,
        team: formData.team,
        status: formData.status,
        priority: formData.priority,
        ahtImpact: formData.ahtImpact,
        costSaving: formData.costSaving,
        qualityImpact: formData.qualityImpact
      });

      if (errors) {
        console.error('❌ Update errors:', errors);
        alert('Failed to update project. Check console for details.');
        return;
      }

      console.log('✅ Project updated successfully:', data);
      setShowEditModal(false);
      
      // Note: Real-time subscription will automatically update the UI
      // But we can also manually refresh to ensure consistency
      await fetchProjects();
    } catch (error) {
      console.error('❌ Error updating project:', error);
      alert('Failed to update project. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Save new project with auto-refresh
  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      console.log('🆕 Creating new project...');
      
      const { data, errors } = await client.models.Project.create({
        name: formData.name!,
        description: formData.description,
        team: formData.team!,
        status: formData.status!,
        priority: formData.priority!,
        ahtImpact: formData.ahtImpact,
        costSaving: formData.costSaving,
        qualityImpact: formData.qualityImpact
      });

      if (errors) {
        console.error('❌ Create errors:', errors);
        alert('Failed to create project. Check console for details.');
        return;
      }

      console.log('✅ Project created successfully:', data);
      setShowNewModal(false);
      
      // Note: Real-time subscription will automatically update the UI
      // But we can also manually refresh to ensure consistency
      await fetchProjects();
    } catch (error) {
      console.error('❌ Error creating project:', error);
      alert('Failed to create project. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh button handler
  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await fetchProjects();
  };

  return (
    <div className="App">
      {/* Header with Action Buttons */}
      <div className="header">
        <h1>AI Project Tracker</h1>
        <div className="header-actions">
          <span className="auth-status" style={{ marginRight: '10px', fontSize: '12px' }}>
            {authStatus}
          </span>
          <button className="btn-logout">Logout</button>
          <button className="btn-import">Import Excel</button>
          <button className="btn-new-project" onClick={handleNewProject}>
            + New Project
          </button>
          <button className="btn-export">Export</button>
          <button 
            className="btn-refresh" 
            onClick={handleManualRefresh}
            disabled={loading}
            style={{ marginLeft: '10px' }}
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ 
          padding: '10px', 
          background: '#e3f2fd', 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ⏳ Loading data...
        </div>
      )}

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
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
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
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


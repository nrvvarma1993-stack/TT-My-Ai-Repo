
import { useState, useEffect } from 'react';
import './App.css';

// Import modal components (you'll create these separately)
import EditProjectModal from './EditProjectModal';
import NewProjectModal from './NewProjectModal';

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
  
  // Your existing projects data (replace with your actual data)
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "AI Chatbot Implementation",
      description: "Develop an AI-powered chatbot for customer support",
      team: "Engineering",
      status: "In Progress",
      priority: "High"
    },
    {
      id: 2,
      name: "Predictive Analytics Dashboard",
      description: "Create a dashboard for predictive analytics",
      team: "Data Science",
      status: "Completed",
      priority: "Medium",
      ahtImpact: 15.5,
      costSaving: 50000,
      qualityImpact: 12.3
    },
    // Add your other projects here
  ]);

  // Filtered projects state
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  // Calculate team stats from projects
  const teamStats: Record<string, TeamStats> = {};
  projects.forEach(project => {
    if (!teamStats[project.team]) {
      teamStats[project.team] = {
        totalProjects: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        ahtImpact: 0,
        costSaving: 0,
        qualityImpact: 0
      };
    }
    
    const stats = teamStats[project.team];
    stats.totalProjects++;
    
    if (project.status === "Not Started") stats.notStarted++;
    if (project.status === "In Progress") stats.inProgress++;
    if (project.status === "Completed") {
      stats.completed++;
      stats.ahtImpact += project.ahtImpact || 0;
      stats.costSaving += project.costSaving || 0;
      stats.qualityImpact += project.qualityImpact || 0;
    }
  });

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
    setShowEditModal(true);
  };

  // New project handler
  const handleNewProject = () => {
    setShowNewModal(true);
  };

  // Save edited project
  const handleSaveEdit = (updatedProject: Project) => {
    setProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
    setShowEditModal(false);
  };

  // Save new project
  const handleSaveNew = (newProject: Project) => {
    setProjects(prev => [...prev, { ...newProject, id: Date.now() }]);
    setShowNewModal(false);
  };

  // Calculate filtered team stats
  const filteredTeamStats: Record<string, TeamStats> = {};
  filteredProjects.forEach(project => {
    if (!filteredTeamStats[project.team]) {
      filteredTeamStats[project.team] = {
        totalProjects: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        ahtImpact: 0,
        costSaving: 0,
        qualityImpact: 0
      };
    }
    
    const stats = filteredTeamStats[project.team];
    stats.totalProjects++;
    
    if (project.status === "Not Started") stats.notStarted++;
    if (project.status === "In Progress") stats.inProgress++;
    if (project.status === "Completed") {
      stats.completed++;
      stats.ahtImpact += project.ahtImpact || 0;
      stats.costSaving += project.costSaving || 0;
      stats.qualityImpact += project.qualityImpact || 0;
    }
  });

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
              
              {/* Edit Button */}
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

      {/* Modals */}
      {showEditModal && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onSave={handleSaveNew}
        />
      )}
    </div>
  );
}

export default App;


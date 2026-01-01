
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { useEffect, useState } from "react";
import "./App.css";

const client = generateClient<Schema>();

function App() {
  const [projects, setProjects] = useState<Array<Schema["Project"]["type"]>>([]);

  useEffect(() => {
    // Fetch AI Projects
    client.models.Project.observeQuery().subscribe({
      next: (data) => setProjects([...data.items]),
    });
  }, []);

  // Calculate metrics
  const totalProjects = projects.length;
  const notStarted = projects.filter(p => p.status === "Not Started").length;
  const inProgress = projects.filter(p => p.status === "In Progress").length;
  const completed = projects.filter(p => p.status === "Completed").length;
  const totalCostSaving = projects.reduce((sum, p) => sum + (p.costSaving || 0), 0);
  const totalAITImpact = projects.reduce((sum, p) => sum + (p.aitImpact || 0), 0);
  const avgQualityImpact = projects.length > 0 
    ? projects.reduce((sum, p) => sum + (p.qualityImpact || 0), 0) / projects.length 
    : 0;

  // Group projects by team
  const teamStats = projects.reduce((acc, project) => {
    const team = project.team || "Unassigned";
    if (!acc[team]) {
      acc[team] = {
        totalProjects: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        aitImpact: 0,
        costSaving: 0,
        qualityImpact: 0
      };
    }
    acc[team].totalProjects++;
    if (project.status === "Not Started") acc[team].notStarted++;
    if (project.status === "In Progress") acc[team].inProgress++;
    if (project.status === "Completed") acc[team].completed++;
    acc[team].aitImpact += project.aitImpact || 0;
    acc[team].costSaving += project.costSaving || 0;
    acc[team].qualityImpact += project.qualityImpact || 0;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>GEN AI Project Management</h1>
        <div className="header-actions">
          <button className="btn-secondary">Import Excel</button>
          <button className="btn-primary">+ New Project</button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-value">{totalProjects}</div>
          <div className="metric-label">Total Projects</div>
        </div>
        <div className="metric-card yellow">
          <div className="metric-value">{inProgress}</div>
          <div className="metric-label">In Progress</div>
        </div>
        <div className="metric-card green">
          <div className="metric-value">{completed}</div>
          <div className="metric-label">Completed</div>
        </div>
        <div className="metric-card gray">
          <div className="metric-value">{notStarted}</div>
          <div className="metric-label">Not Started</div>
        </div>
        <div className="metric-card red">
          <div className="metric-value">0</div>
          <div className="metric-label">On Hold</div>
        </div>
        <div className="metric-card teal">
          <div className="metric-value">{totalAITImpact.toFixed(1)}m</div>
          <div className="metric-label">AIT Impact</div>
        </div>
        <div className="metric-card green-large">
          <div className="metric-value">${totalCostSaving.toLocaleString()}</div>
          <div className="metric-label">Total Cost Saving</div>
        </div>
        <div className="metric-card blue-small">
          <div className="metric-value">{avgQualityImpact.toFixed(1)}%</div>
          <div className="metric-label">Quality Impact</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <select className="filter-select">
          <option>All Status</option>
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select className="filter-select">
          <option>All Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select className="filter-select">
          <option>All Teams</option>
          {Object.keys(teamStats).map(team => (
            <option key={team}>{team}</option>
          ))}
        </select>
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
              <th>AIT Impact</th>
              <th>Cost Saving</th>
              <th>Quality Impact</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(teamStats).map(([team, stats]: [string, any]) => {
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
                  <td>{stats.aitImpact.toFixed(1)}%</td>
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

      {/* AI Features Section */}
      <div className="features-section">
        <div className="feature-card">
          <h3>Vision AI</h3>
          <p>Agentic AI with summarizing capabilities</p>
          <span className="badge">1 more</span>
        </div>
        <div className="feature-card">
          <h3>Voice to Text Annotations</h3>
          <p>Automated UAT testing documentation</p>
          <span className="badge">1 more</span>
        </div>
        <div className="feature-card">
          <h3>SME Chatbot</h3

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { useEffect, useState } from "react";
const client = generateClient<Schema>();
function App() {
  const [projects, setProjects] = useState<Array<Schema["Project"]["type"]>>([]);
  useEffect(() => {
    // Fetch your AI Projects instead of Todos
    client.models.Project.observeQuery().subscribe({
      next: (data) => setProjects([...data.items]),
    });
  }, []);
  return (
    <div className="dashboard-container">
      {/* Header */}
      <h1>GEN AI Project Management</h1>
      {/* Metrics Section (The colored cards in your image) */}
      <div className="metrics-grid">
         <div className="card blue">Total Projects: {projects.length}</div>
         <div className="card green">Cost Savings: ${projects.reduce((sum, p) => sum + (p.costSaving || 0), 0)}</div>
      </div>
      {/* Table Section */}
      <table>
        <thead>
          <tr>
            <th>Team (Impacted)</th>
            <th>Status</th>
            <th>Cost Saving</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.team}</td>
              <td>{project.status}</td>
              <td>{project.costSaving}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import TaskSubmission from './pages/TaskSubmission'
import JobDashboard from './pages/JobDashboard'
import AgentMarketplace from './pages/AgentMarketplace'
import DeveloperConsole from './pages/DeveloperConsole'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/submit" replace />} />
        <Route path="/submit" element={<TaskSubmission />} />
        <Route path="/dashboard" element={<JobDashboard />} />
        <Route path="/marketplace" element={<AgentMarketplace />} />
        <Route path="/developer" element={<DeveloperConsole />} />
      </Routes>
    </Router>
  )
}

export default App


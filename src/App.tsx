import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CreatePollPage } from './pages/CreatePollPage';
import { PollPage } from './pages/PollPage';
import { ResultsPage } from './pages/ResultsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePollPage />} />
          <Route path="/poll/:id" element={<PollPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
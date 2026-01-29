import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import ScanPage from './pages/ScanPage';
import './styles/index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/scan" element={<ScanPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

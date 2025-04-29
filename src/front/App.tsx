// src/front/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorkspacesPage from './Pages/Workspaces';
import WorkspaceDetailPage from './Pages/WorkspaceDetailPage';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<WorkspacesPage />} />
      <Route path="/workspace/:id" element={<WorkspaceDetailPage />} /> {/* L'ID sera passé ici */}
    </Routes>
  </Router>
);

export default App;

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import WaterDataForm from './components/WaterDataForm/WaterDataForm';
import './App.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleDataSubmitted = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_URL || '/'}>
      <div className="app">
        <Navbar />
        <main className="app__main">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                  refreshKey={refreshKey}
                />
              }
            />
            <Route
              path="/submit"
              element={
                <WaterDataForm
                  initialLocation={selectedLocation}
                  onSubmitted={handleDataSubmitted}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

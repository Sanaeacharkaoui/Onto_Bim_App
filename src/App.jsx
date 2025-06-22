import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import ImportIFC from './pages/ImportIFC';
import ConvertToRDF from './pages/ConvertToRDF';
import CheckRequirements from './pages/CheckRequirements';
import ExploreData from './pages/ExploreData';
export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/import" element={<ImportIFC />} />
          <Route path="/convert" element={<ConvertToRDF />} />
          <Route path="/security" element={<CheckRequirements />} />
          <Route path="/explore" element={<ExploreData />} />

        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

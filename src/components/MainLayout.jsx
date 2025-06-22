import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import Header from './Header';

export default function MainLayout({ children }) {
  const { pathname } = useLocation();

  // Détermine l'index de l'onglet actif
  let activeIndex = 0;
  if (pathname === '/') {
    activeIndex = 0;
  } else if (pathname.startsWith('/import') || pathname.startsWith('/convert')) {
    activeIndex = 1;
  } else if (pathname.startsWith('/security')) {
    activeIndex = 2;
  } else if (pathname.startsWith('/results')) {
    activeIndex = 3;
  } else if (pathname.startsWith('/report')) {
    activeIndex = 4;
  } else if (pathname.startsWith('/explore')) {
    activeIndex = 5;
  }

  return (
    <div className="flex h-screen">
      {/* On passe activeIndex ici */}
      <Sidebar activeIndex={activeIndex} />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-white flex flex-col items-center justify-center p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

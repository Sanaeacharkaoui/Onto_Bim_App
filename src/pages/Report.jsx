/*Report.jsx*/

import React from 'react';
import { useLocation } from 'react-router-dom';
import { generateReport } from '../utils/reportGenerator';

export default function Report() {
  const { state } = useLocation();
  const rule = state?.rule || 'Règle inconnue';
  const results = state?.results || [];

  const report = generateReport(rule, results);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">{report.title}</h1>
      <p className="text-gray-600 italic mb-4">{report.description}</p>

      <div className="bg-white p-4 rounded shadow-md w-full max-w-3xl mx-auto space-y-4">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          📅 {report.date}
        </div>

        <div className="flex items-center gap-6">
          <p className="font-medium">
            Total : <strong>{report.total}</strong>
          </p>
          <p className="font-medium">
            Statut :{' '}
            {report.passed ? (
              <span className="text-green-700 bg-green-100 px-2 py-1 rounded">✅ Conforme</span>
            ) : (
              <span className="text-red-700 bg-red-100 px-2 py-1 rounded">❌ Non conforme</span>
            )}
          </p>
        </div>

        {report.details.map((item, i) => (
          <pre
            key={i}
            className="bg-gray-100 rounded px-3 py-2 overflow-auto text-sm"
          >
            {item.message}
          </pre>
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard page - Overview of classes, tests, and recent activity
 * TODO: Implement in future milestones
 */

import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            gr<span className="text-blue-600">AI</span>de Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/inbox')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Photo Inbox</h3>
            <p className="text-gray-600">Sort and assign test photos</p>
          </button>

          <button
            onClick={() => navigate('/classes')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Classes</h3>
            <p className="text-gray-600">Manage classes and students</p>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">View patterns and insights</p>
          </button>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Welcome to grAIde!</h2>
          <p className="text-gray-700">
            This is the project scaffold. Features will be implemented in upcoming milestones.
          </p>
        </div>
      </main>
    </div>
  );
}

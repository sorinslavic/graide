/**
 * Dashboard page - Overview of classes, tests, and recent activity
 */

import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Teacher'}! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what you can do in grAIde
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/inbox')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-3xl mb-3">📥</div>
            <h3 className="text-lg font-semibold mb-2">Photo Inbox</h3>
            <p className="text-gray-600 text-sm">
              Sort and assign test photos from your phone
            </p>
            <p className="text-xs text-gray-500 mt-2">Coming in Milestone 2</p>
          </button>

          <button
            onClick={() => navigate('/classes')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold mb-2">Classes</h3>
            <p className="text-gray-600 text-sm">
              Manage classes and students
            </p>
            <p className="text-xs text-blue-600 mt-2 font-medium">
              ✅ Available now! (Milestone 1)
            </p>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">
              View patterns and insights
            </p>
            <p className="text-xs text-gray-500 mt-2">Coming in Milestone 5</p>
          </button>
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🎉 Phase 1 Complete: Authentication Working!
          </h3>
          <p className="text-blue-800 text-sm">
            You're now logged in with Google OAuth. Try navigating to the
            Classes page to manage your classes and students (coming in Phase 5).
          </p>
          <ul className="mt-3 space-y-1 text-sm text-blue-700">
            <li>✅ Google OAuth login</li>
            <li>✅ Protected routes</li>
            <li>✅ User profile display</li>
            <li>✅ Logout functionality</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

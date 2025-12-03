import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Discord Bot Manager</h1>
          <p className="text-lg mb-8">Manage your Discord server with advanced moderation and economy features</p>
          <Button className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => window.location.href = getLoginUrl()}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Discord Bot Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <p className="text-3xl font-bold mt-2">1,250</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Moderation Actions</h3>
            <p className="text-3xl font-bold mt-2">23</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Economy Balance</h3>
            <p className="text-3xl font-bold mt-2">125K</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Bot Management</h2>
          <p className="text-gray-600 mb-4">Discord Bot Manager is ready to manage your server with:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Advanced moderation tools (ban, kick, warn, mute)</li>
            <li>Economy system with balance and leaderboards</li>
            <li>Role management and auto-assignment</li>
            <li>Comprehensive logging and analytics</li>
            <li>Real-time server statistics</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

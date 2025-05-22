import {
  BarChart3,
  Users,
  FileText,
  Flag,
  ArrowUp,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="bg-white text-black">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back to your Medicare admin dashboard.
        </p>
      </header>

      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-500">Total Posts</h3>
            <span className="icon-circle">
              <FileText className="h-5 w-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">24</div>
            <div className="trend-up mt-1">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>+2 from last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-500">Services</h3>
            <span className="icon-circle">
              <Flag className="h-5 w-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">12</div>
            <div className="trend-up mt-1">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>+1 from last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-500">Team Members</h3>
            <span className="icon-circle">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">8</div>
            <div className="trend-same mt-1">
              <span>Same as last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-500">Media Files</h3>
            <span className="icon-circle">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">145</div>
            <div className="trend-up mt-1">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>+15 from last month</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="chart-container col-span-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg text-gray-900">
              Analytics Overview
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View Details
            </button>
          </div>
          <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Analytics chart would go here</p>
            </div>
          </div>
        </div>

        <div className="recent-posts col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg text-gray-900">
              Recent Posts
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </button>
          </div>
          <div className="space-y-5">
            <div className="post-item">
              <h4 className="font-medium text-gray-900 mb-1">
                Medicare coverage updates for 2023
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Published 2 days ago
                </span>
                <button className="text-blue-600 hover:text-blue-800">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="post-item">
              <h4 className="font-medium text-gray-900 mb-1">
                New preventive care benefits explained
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Published 5 days ago
                </span>
                <button className="text-blue-600 hover:text-blue-800">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="post-item">
              <h4 className="font-medium text-gray-900 mb-1">
                How to access telehealth services
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Published 1 week ago
                </span>
                <button className="text-blue-600 hover:text-blue-800">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

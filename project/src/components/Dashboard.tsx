import { useState } from 'react';
import {
  LogOut,
  User,
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  TrendingUp,
  DollarSign,
  Calendar,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VoucherPage } from './VoucherPage';

type NavItem = {
  name: string;
  icon: typeof LayoutDashboard;
  section: string;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { name: 'Voucher', icon: FileText, section: 'voucher' },
  { name: 'Opps', icon: TrendingUp, section: 'opps' },
  { name: 'Capex', icon: DollarSign, section: 'capex' },
  { name: 'Investment', icon: Heart, section: 'investment' },
  { name: 'Visualization', icon: TrendingUp, section: 'visualization' },
  { name: 'Loans', icon: DollarSign, section: 'loans' },
  { name: 'Planning', icon: Calendar, section: 'planning' },
];

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">MyPortfolio</h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.section;
              return (
                <button
                  key={item.section}
                  onClick={() => {
                    setActiveSection(item.section);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 px-6 py-4 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'voucher' ? (
              <VoucherPage />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 capitalize">
                  {activeSection}
                </h2>

                {activeSection === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-slate-700">Total Users</h3>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">1,234</p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="font-semibold text-slate-700">Revenue</h3>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">$45,678</p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-orange-600" />
                          </div>
                          <h3 className="font-semibold text-slate-700">Growth</h3>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">+12%</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Account Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-slate-500">Email:</span>
                          <p className="text-slate-900">{user?.email}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-500">User ID:</span>
                          <p className="text-slate-900 font-mono text-sm">{user?.id}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-500">Account created:</span>
                          <p className="text-slate-900">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection !== 'dashboard' && (
                  <div className="text-center py-12">
                    <p className="text-slate-600">
                      {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} content will be displayed here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

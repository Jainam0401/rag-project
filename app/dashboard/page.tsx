'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const countries = [
    { name: 'United States', flag: '🇺🇸', code: 'usa' },
    { name: 'United Kingdom', flag: '🇬🇧', code: 'uk' },
    { name: 'Canada', flag: '🇨🇦', code: 'canada' },
    { name: 'Australia', flag: '🇦🇺', code: 'australia' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Study Abroad Assistant</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Destination
          </h2>
          <p className="text-lg text-gray-600">
            Select a country to get AI-powered guidance on studying abroad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => router.push(`/chat?country=${country.code}`)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 text-center group"
            >
              <div className="text-6xl mb-4">{country.flag}</div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                {country.name}
              </h3>
            </button>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Select Country</h4>
              <p className="text-gray-600">Choose from USA, UK, Canada, or Australia</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Ask Questions</h4>
              <p className="text-gray-600">Get answers about visas, costs, universities</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get Guidance</h4>
              <p className="text-gray-600">Receive AI-powered answers from official guides</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
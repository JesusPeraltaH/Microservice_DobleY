'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';

interface NavbarProps {
  isAuthenticated?: boolean;
  userEmail?: string;
}

export default function Navbar({ isAuthenticated = false, userEmail }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement logout logic with Supabase
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              MicroStore
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
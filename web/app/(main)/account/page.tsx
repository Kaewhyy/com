'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { api } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; email: string; addresses?: { label: string; street: string; city: string }[] } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/account');
      return;
    }
    api.get('/users/me').then((res) => {
      setProfile(res.data.data ?? res.data);
    });
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Account</h1>
      {profile && (
        <div className="space-y-6 rounded-xl border bg-white p-6">
          <div>
            <h3 className="font-semibold text-gray-500">Name</h3>
            <p className="text-lg">{profile.firstName} {profile.lastName}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-500">Email</h3>
            <p className="text-lg">{profile.email}</p>
          </div>
          {profile.addresses && profile.addresses.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-500">Addresses</h3>
              <ul className="mt-2 space-y-2">
                {profile.addresses.map((addr, i) => (
                  <li key={i} className="rounded-lg border p-3">
                    <span className="font-medium">{addr.label}</span>
                    <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function AdminPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login?redirect=/admin');
      return;
    }
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    api.get('/admin/dashboard').then((res) => setDashboard(res.data.data ?? res.data)).catch(() => router.push('/login'));
  }, [token, user, router]);

  if (!dashboard) return <div className="mx-auto max-w-7xl px-4 py-16 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-bold">{String(dashboard.totalUsers ?? 0)}</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-gray-500">Total Orders</h3>
          <p className="mt-2 text-3xl font-bold">{String(dashboard.totalOrders ?? 0)}</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-gray-500">Revenue</h3>
          <p className="mt-2 text-3xl font-bold">${Number(dashboard.totalRevenue ?? 0).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

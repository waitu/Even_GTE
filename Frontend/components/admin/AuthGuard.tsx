'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '../../lib/admin/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!getAdminToken()) {
      router.replace('/admin/login');
    }
  }, [router]);
  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AgentsListPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page principale des agents
    router.replace('/admin/Agents');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default AgentsListPage;

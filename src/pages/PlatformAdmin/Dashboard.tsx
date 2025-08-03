import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PlatformAdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Platform Admin!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This dashboard will provide an overview of the entire platform, including statistics on academies, users, and more.</p>
          <p className="mt-4 text-sm text-muted-foreground">Feature coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAdminDashboard;

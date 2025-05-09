import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Gift, Settings, Users, CheckCircle2 } from 'lucide-react';
import { getBonuses } from './bonuses/_actions'; // Import the (now mocked) action
import type { Bonus } from '@/schemas/bonus';

export const dynamic = 'force-dynamic'; // Ensures fresh data on each request, good for when data changes

export default async function AdminDashboardPage() {
  const bonuses: Bonus[] = await getBonuses();
  const activeBonusesCount = bonuses.filter(b => b.isActive).length;
  // Placeholder for total users if that data becomes available
  const totalUsersCount = "N/A"; 

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Sohoz88 management panel.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manage Bonuses</CardTitle>
            <Gift className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Create, edit, and manage promotional bonuses for users.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/bonuses">Go to Bonuses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Settings</CardTitle>
            <Settings className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Customize site appearance, like the background.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Placeholder for future User Management card
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              (Coming Soon) View and manage user accounts.
            </p>
            <Button size="sm" disabled>
              Go to Users
            </Button>
          </CardContent>
        </Card>
        */}
      </div>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Quick Stats</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Bonuses</CardTitle>
                     <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeBonusesCount}</div>
                    <p className="text-xs text-muted-foreground">Currently active promotions</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                     <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsersCount}</div>
                    <p className="text-xs text-muted-foreground">Registered users count</p>
                </CardContent>
            </Card>
        </div>
         { totalUsersCount === "N/A" && <p className="text-sm text-muted-foreground mt-4">Note: User stats require database integration.</p>}
      </section>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBonuses, deleteBonus } from './_actions'; // Assuming getBonuses is here
import type { Bonus } from '@/schemas/bonus';
import { PlusCircle, Edit, Trash2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DeleteBonusButton from './_components/delete-bonus-button'; // Client component for confirm dialog

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export default async function BonusesPage() {
  const bonuses: Bonus[] = await getBonuses();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bonus Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage promotional bonuses.</p>
        </div>
        <Button asChild>
          <Link href="/admin/bonuses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Bonus
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Bonuses</CardTitle>
          <CardDescription>
            {bonuses.length > 0 ? `Showing ${bonuses.length} bonus(es).` : 'No bonuses found. Add one to get started!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bonuses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Turnover</TableHead>
                  <TableHead className="hidden lg:table-cell">Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonuses.map((bonus) => (
                  <TableRow key={bonus._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{bonus.title}</span>
                        <Link href={bonus.ctaLink} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                          CTA <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{bonus.turnoverRequirement}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {bonus.imageUrl ? (
                        <Link href={bonus.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline text-primary">
                          View Image
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={bonus.isActive ? 'default' : 'secondary'} className={bonus.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                        {bonus.isActive ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                        {bonus.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/admin/bonuses/edit/${bonus._id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <DeleteBonusButton bonusId={bonus._id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-10">
                <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">No bonuses yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new bonus.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

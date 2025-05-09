import BonusForm from '../../_components/bonus-form';
import { getBonusById, updateBonus } from '../../_actions';
import type { Bonus, BonusFormData } from '@/schemas/bonus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export const dynamic = 'force-dynamic';

interface EditBonusPageProps {
  params: { id: string };
}

export default async function EditBonusPage({ params }: EditBonusPageProps) {
  const bonus = await getBonusById(params.id) as Bonus | null;

  if (!bonus) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Bonus</h1>
         <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Bonus not found. It might have been deleted or the ID is incorrect.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Prepare initial data for the form. _id is not part of BonusFormData.
  const initialFormData: BonusFormData = {
    title: bonus.title,
    description: bonus.description,
    turnoverRequirement: bonus.turnoverRequirement,
    imageUrl: bonus.imageUrl,
    ctaLink: bonus.ctaLink,
    isActive: bonus.isActive,
  };
  
  const handleUpdateBonus = async (data: BonusFormData) => {
    return updateBonus(params.id, data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Bonus</h1>
        <p className="text-muted-foreground">Update the details for the bonus: "{bonus.title}".</p>
      </div>
      <Card>
         <CardHeader>
            <CardTitle>Bonus Details</CardTitle>
            <CardDescription>Modify the information for this bonus.</CardDescription>
        </CardHeader>
        <CardContent>
            <BonusForm
                initialData={initialFormData}
                onSubmitAction={handleUpdateBonus}
                submitButtonText="Update Bonus"
            />
        </CardContent>
      </Card>
    </div>
  );
}

import BonusForm from '../_components/bonus-form';
import { createBonus } from '../_actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewBonusPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Bonus</h1>
        <p className="text-muted-foreground">Fill in the details below to create a new promotion.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Bonus Details</CardTitle>
            <CardDescription>Provide all the necessary information for the new bonus.</CardDescription>
        </CardHeader>
        <CardContent>
            <BonusForm onSubmitAction={createBonus} submitButtonText="Create Bonus" />
        </CardContent>
      </Card>
    </div>
  );
}

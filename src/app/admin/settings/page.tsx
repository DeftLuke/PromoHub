import SettingsForm from './_components/settings-form';
import { getSiteSettings, updateSiteSettings } from './_actions';
import type { SiteSettingsFormData } from '@/schemas/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  // Ensure settings is not null, provide defaults if it is (though getSiteSettings should handle this)
  const initialData: SiteSettingsFormData = settings || {
    backgroundType: 'color',
    backgroundValue: '#FFFFFF', // A sensible default
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">Customize global site settings like background.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Background Configuration</CardTitle>
            <CardDescription>Set the main background for the public site.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            initialData={initialData}
            onSubmitAction={updateSiteSettings}
          />
        </CardContent>
      </Card>
    </div>
  );
}

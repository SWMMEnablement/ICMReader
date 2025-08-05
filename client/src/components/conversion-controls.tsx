import { Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ConversionSettings } from '@/types/prn';

interface ConversionControlsProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
}

export function ConversionControls({ settings, onSettingsChange }: ConversionControlsProps) {
  const updateSetting = (key: keyof ConversionSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Conversion Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2">Flow Units</Label>
          <Select
            value={settings.flowUnits}
            onValueChange={(value) => updateSetting('flowUnits', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="si-to-us">SI to US Customary (m³/s → cfs)</SelectItem>
              <SelectItem value="us-to-si">US Customary to SI (cfs → m³/s)</SelectItem>
              <SelectItem value="no-conversion">No Conversion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2">Length Units</Label>
          <Select
            value={settings.lengthUnits}
            onValueChange={(value) => updateSetting('lengthUnits', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="m-to-ft">Meters to Feet</SelectItem>
              <SelectItem value="ft-to-m">Feet to Meters</SelectItem>
              <SelectItem value="no-conversion">No Conversion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2">Precision</Label>
          <Select
            value={settings.precision.toString()}
            onValueChange={(value) => updateSetting('precision', parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 decimal places</SelectItem>
              <SelectItem value="3">3 decimal places</SelectItem>
              <SelectItem value="4">4 decimal places</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 flex items-center">
          <Info className="h-3 w-3 text-primary mr-1" />
          Conversion factors: 1 m³/s = 35.3147 cfs, 1 meter = 3.28084 feet
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText, Settings, HelpCircle } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { ConversionControls } from '@/components/conversion-controls';
import { ResultsDisplay } from '@/components/results-display';
import { useToast } from '@/hooks/use-toast';
import { validatePrnFile, createFormData } from '@/lib/file-parser';
import { apiRequest } from '@/lib/queryClient';
import type { ConversionSettings, PrnData, FileUploadResult } from '@/types/prn';

export default function Home() {
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [prnData, setPrnData] = useState<PrnData | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    flowUnits: 'si-to-us',
    lengthUnits: 'm-to-ft',
    precision: 2,
  });
  
  const { toast } = useToast();

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<FileUploadResult> => {
      const formData = createFormData(file);
      const response = await apiRequest('POST', '/api/prn/upload', formData);
      return response.json();
    },
    onSuccess: (result) => {
      setCurrentFileId(result.fileId);
      setPrnData(result.data);
      toast({
        title: 'File uploaded successfully',
        description: 'PRN file has been parsed and is ready for analysis.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Unit conversion mutation
  const convertMutation = useMutation({
    mutationFn: async ({ fileId, settings }: { fileId: string; settings: ConversionSettings }) => {
      const response = await apiRequest('POST', '/api/prn/convert', { fileId, settings });
      return response.json();
    },
    onSuccess: (convertedData) => {
      setPrnData(convertedData);
      toast({
        title: 'Units converted',
        description: 'Data has been converted to the selected units.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Conversion failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (file: File) => {
    const validation = validatePrnFile(file);
    if (!validation.isValid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleSettingsChange = (newSettings: ConversionSettings) => {
    setSettings(newSettings);
    
    if (currentFileId) {
      convertMutation.mutate({
        fileId: currentFileId,
        settings: newSettings,
      });
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!currentFileId) {
      toast({
        title: 'No data to export',
        description: 'Please upload a PRN file first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (format === 'csv') {
        const url = `/api/prn/${currentFileId}/export?settings=${encodeURIComponent(JSON.stringify(settings))}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = 'prn_data.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Export started',
          description: 'CSV file download has been initiated.',
        });
      } else {
        toast({
          title: 'Feature coming soon',
          description: 'PDF export functionality will be available in a future update.',
        });
      }
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ICM PRN File Reader</h1>
                <p className="text-xs text-gray-500">Engineering Data Analysis Tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <HelpCircle className="h-5 w-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload Section */}
        <div className="mb-8">
          <FileUpload
            onFileSelect={handleFileSelect}
            isUploading={uploadMutation.isPending}
            uploadProgress={uploadMutation.isPending ? 65 : undefined}
            error={uploadMutation.error?.message}
          />
        </div>

        {/* Conversion Controls */}
        <div className="mb-8">
          <ConversionControls
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>

        {/* Results Display */}
        <ResultsDisplay
          data={prnData}
          fileId={currentFileId || undefined}
          settings={settings}
          onExport={handleExport}
        />
      </main>
    </div>
  );
}

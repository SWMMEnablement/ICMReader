import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Cloud, Upload, File, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
}

export function FileUpload({ onFileSelect, isUploading, uploadProgress, error }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.prn', '.txt']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload PRN File</h2>
        <p className="text-sm text-gray-600">
          Select or drag and drop your ICM InfoWorks PRN simulation file for analysis
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="mb-4">
          <Cloud className="mx-auto h-10 w-10 text-gray-400" />
        </div>
        <div className="mb-4">
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your PRN file here
          </p>
          <p className="text-sm text-gray-500">or click to browse files</p>
        </div>
        <div className="flex justify-center">
          <Button 
            variant="default" 
            disabled={isUploading}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <File className="mr-2 h-4 w-4" />
                Select File
              </>
            )}
          </Button>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Supported formats: .prn, .txt • Maximum file size: 50MB
        </div>
      </div>

      {isUploading && uploadProgress !== undefined && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Upload className="h-5 w-5 text-blue-500 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-blue-900">Processing PRN file...</p>
              <p className="text-xs text-blue-700">Parsing structure and validating data format</p>
            </div>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {error && (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

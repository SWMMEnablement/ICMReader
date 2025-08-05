export function validatePrnFile(file: File): { isValid: boolean; error?: string } {
  // Check file extension
  if (!file.name.toLowerCase().endsWith('.prn') && !file.name.toLowerCase().endsWith('.txt')) {
    return { isValid: false, error: 'File must be a .prn or .txt file' };
  }
  
  // Check file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 50MB' };
  }
  
  return { isValid: true };
}

export function createFormData(file: File): FormData {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from 'firebase/storage';
import type { UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '../config/firebase';

// Error types
export interface ImageUploadError {
  code: string;
  message: string;
}

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void;

// Supported image types
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

class ImageUploadService {
  // Validate image file
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)',
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'Image file size must be less than 5MB',
      };
    }

    return { isValid: true };
  }

  // Generate unique filename
  private generateFileName(originalName: string, restaurantId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `menu-items/${restaurantId}/${timestamp}-${randomString}.${extension}`;
  }

  // Upload image with progress tracking
  async uploadImage(
    file: File,
    restaurantId: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      // Validate file
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Generate unique filename
      const fileName = this.generateFileName(file.name, restaurantId);
      const storageRef = ref(storage, fileName);

      // Upload with progress tracking if callback provided
      if (onProgress) {
        return new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(new Error(this.getUploadErrorMessage(error.code)));
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(new Error('Failed to get download URL'));
              }
            }
          );
        });
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      // Handle demo mode - return a placeholder image URL
      if (restaurantId === 'demo-restaurant-123') {
        console.log('Demo mode: returning placeholder image URL');
        return this.getPlaceholderImageUrl();
      }
      
      throw new Error(error.message || 'Failed to upload image');
    }
  }

  // Delete image from storage
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const filePath = this.extractFilePathFromUrl(imageUrl);
      if (!filePath) {
        throw new Error('Invalid image URL');
      }

      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      
      // Don't throw error for demo mode or if file doesn't exist
      if (error.code === 'storage/object-not-found' || imageUrl.includes('placeholder')) {
        console.log('Image not found or is placeholder, skipping deletion');
        return;
      }
      
      throw new Error(error.message || 'Failed to delete image');
    }
  }

  // Extract file path from Firebase Storage URL
  private extractFilePathFromUrl(url: string): string | null {
    try {
      // Firebase Storage URLs have the format:
      // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/);
      if (pathMatch) {
        return decodeURIComponent(pathMatch[1]);
      }
      return null;
    } catch (error) {
      console.error('Error extracting file path from URL:', error);
      return null;
    }
  }

  // Get user-friendly error message
  private getUploadErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'storage/unauthorized':
        return 'You do not have permission to upload images';
      case 'storage/canceled':
        return 'Upload was canceled';
      case 'storage/quota-exceeded':
        return 'Storage quota exceeded';
      case 'storage/invalid-format':
        return 'Invalid file format';
      case 'storage/invalid-event-name':
        return 'Invalid upload event';
      case 'storage/invalid-url':
        return 'Invalid storage URL';
      case 'storage/invalid-argument':
        return 'Invalid upload argument';
      case 'storage/no-default-bucket':
        return 'No default storage bucket configured';
      case 'storage/cannot-slice-blob':
        return 'File cannot be processed';
      case 'storage/server-file-wrong-size':
        return 'File size mismatch on server';
      default:
        return 'Failed to upload image. Please try again.';
    }
  }

  // Get placeholder image URL for demo mode
  private getPlaceholderImageUrl(): string {
    const placeholders = [
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
    ];
    
    // Return a random placeholder
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }

  // Resize image before upload (optional utility)
  async resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Get supported file types for input accept attribute
  getSupportedFileTypes(): string {
    return SUPPORTED_IMAGE_TYPES.join(',');
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();
export default imageUploadService;

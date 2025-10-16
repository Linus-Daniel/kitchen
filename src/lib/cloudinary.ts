import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  static async uploadImage(
    file: File | Buffer,
    folder: string = 'general',
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      let uploadData: string;

      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        uploadData = `data:${file.type};base64,${buffer.toString('base64')}`;
      } else {
        uploadData = `data:image/jpeg;base64,${file.toString('base64')}`;
      }

      const result = await cloudinary.uploader.upload(uploadData, {
        folder,
        transformation: {
          width: options.width,
          height: options.height,
          crop: options.crop || 'fill',
          quality: options.quality || 'auto',
          format: options.format || 'auto',
        },
        resource_type: 'auto',
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async uploadAvatar(file: File | Buffer): Promise<CloudinaryUploadResult> {
    return this.uploadImage(file, 'avatars', {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 80,
      format: 'webp',
    });
  }

  static async uploadProductImage(file: File | Buffer): Promise<CloudinaryUploadResult> {
    return this.uploadImage(file, 'products', {
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 85,
      format: 'webp',
    });
  }

  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Image deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static generateTransformationUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    }
  ): string {
    return cloudinary.url(publicId, {
      transformation: {
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        quality: options.quality || 'auto',
        format: options.format || 'auto',
      },
    });
  }
}

export default CloudinaryService;
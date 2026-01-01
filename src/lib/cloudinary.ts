import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const uploadToCloudinary = async (buffer: Buffer, folder: string, publicId?: string): Promise<string> => {
  // Folder structure:
  // - spyberpolymath/image/blog (blog post images)
  // - spyberpolymath/image/projects (project images)
  // - spyberpolymath/projects/pdf (project PDFs - for future use)
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        reject(error);
      } else if (result) {
        resolve(result.secure_url);
      } else {
        reject(new Error('Upload failed'));
      }
    }).end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export const extractPublicId = (url: string): string | null => {
  // Extract public ID from Cloudinary URL
  // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  return match ? match[1] : null;
};
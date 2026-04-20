import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

function ensureConfigured() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not configured. Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET"
    );
  }
}

function publicIdFromCloudinaryUrl(url) {
  // Typical secure_url:
  // https://res.cloudinary.com/<cloud>/image/upload/v1712345678/folder/name.jpg
  // public_id => folder/name
  if (!url || typeof url !== "string") return null;
  if (!url.includes("res.cloudinary.com")) return null;

  const uploadMarker = "/upload/";
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return null;

  let rest = url.slice(idx + uploadMarker.length); // v.../folder/name.jpg
  rest = rest.replace(/^v\d+\//, ""); // folder/name.jpg

  // strip querystring if present
  rest = rest.split("?")[0];

  // remove extension
  const dot = rest.lastIndexOf(".");
  if (dot > rest.lastIndexOf("/")) {
    rest = rest.slice(0, dot);
  }

  return rest || null;
}

export async function uploadToCloudinary(fileBuffer, fileName, folder = "uploads", mimeType) {
  ensureConfigured();

  const isVideo = typeof mimeType === "string" && mimeType.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";

  const safeName = String(fileName || "file")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();

  const publicIdBase = `${Date.now()}-${safeName}`.replace(/\.[^.]+$/, "");

  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicIdBase,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || result?.url);
      }
    );

    stream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(fileUrl) {
  ensureConfigured();
  const publicId = publicIdFromCloudinaryUrl(fileUrl);
  if (!publicId) return false;

  // Try image first, then video.
  const imageRes = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
  if (imageRes?.result === "ok" || imageRes?.result === "not found") return true;

  const videoRes = await cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
    invalidate: true,
  });
  return videoRes?.result === "ok" || videoRes?.result === "not found";
}


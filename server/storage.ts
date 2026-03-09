/**
 * Local file storage - 100% independent, no external services
 * Files are stored locally in the project directory
 */

import * as fs from "fs";
import * as path from "path";
import { nanoid } from "nanoid";

const STORAGE_DIR = path.join(process.cwd(), "storage");

/**
 * Ensure storage directory exists
 */
function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Store file locally and return path
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  ensureStorageDir();

  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(STORAGE_DIR, key);
  const fileDir = path.dirname(filePath);

  // Create subdirectories if needed
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }

  // Write file
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  fs.writeFileSync(filePath, buffer);

  // Return local URL (relative path)
  const url = `/storage/${key}`;

  return { key, url };
}

/**
 * Retrieve file from local storage
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(STORAGE_DIR, key);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${key}`);
  }

  // Return local URL
  const url = `/storage/${key}`;

  return { key, url };
}

/**
 * Delete file from local storage
 */
export async function storageDelete(relKey: string): Promise<void> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(STORAGE_DIR, key);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Check if file exists in local storage
 */
export async function storageExists(relKey: string): Promise<boolean> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(STORAGE_DIR, key);
  return fs.existsSync(filePath);
}

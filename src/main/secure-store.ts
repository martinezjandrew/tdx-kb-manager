import fs from "fs";
import path from "path";
import crypto from "crypto";
import { app, safeStorage } from "electron";

const keyPath = path.join(app.getPath("userData"), "api-key.enc");
const fallbackKeyPath = path.join(app.getPath("userData"), "api-key-fallback.enc");

// Fallback crypto implementation
function saveApiKeyLocal(apiKey: string) {
  const iv = crypto.randomBytes(12);
  const secret = crypto.scryptSync("some-hardcoded-secret", "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-gcm", secret, iv);
  const encrypted = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  fs.writeFileSync(fallbackKeyPath, Buffer.concat([iv, tag, encrypted]));
}

function loadApiKeyLocal(): string | null {
  if (!fs.existsSync(fallbackKeyPath)) return null;
  const data = fs.readFileSync(fallbackKeyPath);
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const secret = crypto.scryptSync("some-hardcoded-secret", "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", secret, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8");
}

export function saveApiKey(apiKey: string): void {
  console.log('inside secure store')
  console.log('Encryption available:', safeStorage.isEncryptionAvailable())
  console.log('Storage backend:', safeStorage.getSelectedStorageBackend())
  
  if (safeStorage.isEncryptionAvailable()) {
    console.log('Using secure storage')
    const encrypted = safeStorage.encryptString(apiKey)
    fs.writeFileSync(keyPath, encrypted)
    
    // Clean up fallback file if it exists
    if (fs.existsSync(fallbackKeyPath)) {
      fs.unlinkSync(fallbackKeyPath)
    }
  } else {
    console.warn('Secure storage not available, using crypto fallback method')
    saveApiKeyLocal(apiKey)
    
    // Clean up secure file if it exists
    if (fs.existsSync(keyPath)) {
      fs.unlinkSync(keyPath)
    }
  }
}

export function loadApiKey(): string | null {
  if (safeStorage.isEncryptionAvailable() && fs.existsSync(keyPath)) {
    console.log('Loading from secure storage')
    try {
      const encrypted = fs.readFileSync(keyPath)
      const decrypted = safeStorage.decryptString(encrypted)
      return decrypted
    } catch (error) {
      console.warn('Failed to decrypt with safeStorage, trying crypto fallback')
      return loadApiKeyLocal()
    }
  } else if (fs.existsSync(fallbackKeyPath)) {
    console.warn('Loading from crypto fallback storage')
    return loadApiKeyLocal()
  } else {
    return null
  }
}

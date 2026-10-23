import fs from 'fs';

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Extracts width and height from common image formats (PNG, JPEG, GIF, WEBP, SVG)
 * without external dependencies.
 */
export function getImageDimensions(filePath: string): ImageDimensions | null {
  try {
    const buffer = fs.readFileSync(filePath);
    return getImageDimensionsFromBuffer(buffer);
  } catch {
    return null;
  }
}

export function getImageDimensionsFromBuffer(buf: Buffer): ImageDimensions | null {
  if (!buf || buf.length < 16) return null;

  // 1. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    if (buf.length >= 24) {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      if (width > 0 && height > 0) return { width, height };
    }
  }

  // 2. GIF: 'GIF87a' or 'GIF89a'
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    if (buf.length >= 10) {
      const width = buf.readUInt16LE(6);
      const height = buf.readUInt16LE(8);
      if (width > 0 && height > 0) return { width, height };
    }
  }

  // 3. WebP: 'RIFF' .... 'WEBP'
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    // VP8 chunk
    if (buf[12] === 0x56 && buf[13] === 0x50 && buf[14] === 0x38 && buf[15] === 0x20) {
      if (buf.length >= 30) {
        const width = buf.readUInt16LE(26) & 0x3fff;
        const height = buf.readUInt16LE(28) & 0x3fff;
        if (width > 0 && height > 0) return { width, height };
      }
    }
    // VP8L chunk (lossless)
    if (buf[12] === 0x56 && buf[13] === 0x50 && buf[14] === 0x38 && buf[15] === 0x4c) {
      if (buf.length >= 25 && buf[20] === 0x2f) {
        const b1 = buf[21];
        const b2 = buf[22];
        const b3 = buf[23];
        const b4 = buf[24];
        const width = 1 + (((b2 & 0x3f) << 8) | b1);
        const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
        if (width > 0 && height > 0) return { width, height };
      }
    }
    // VP8X chunk (extended)
    if (buf[12] === 0x56 && buf[13] === 0x50 && buf[14] === 0x38 && buf[15] === 0x58) {
      if (buf.length >= 30) {
        const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
        const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
        if (width > 0 && height > 0) return { width, height };
      }
    }
  }

  // 4. JPEG: Starts with FF D8
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length - 8) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      // Standalone markers without length
      if (marker === 0xd8 || marker === 0xd9 || marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      const length = buf.readUInt16BE(offset + 2);
      // SOF markers containing image dimensions
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        if (width > 0 && height > 0) return { width, height };
      }
      offset += 2 + length;
    }
  }

  // 5. SVG
  const headStr = buf.slice(0, Math.min(buf.length, 2048)).toString('utf8');
  if (headStr.includes('<svg')) {
    const viewBoxMatch = headStr.match(/viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s*["']/i);
    if (viewBoxMatch) {
      const width = Math.round(parseFloat(viewBoxMatch[1]));
      const height = Math.round(parseFloat(viewBoxMatch[2]));
      if (width > 0 && height > 0) return { width, height };
    }
    const widthMatch = headStr.match(/width\s*=\s*["']([\d.]+)p?x?["']/i);
    const heightMatch = headStr.match(/height\s*=\s*["']([\d.]+)p?x?["']/i);
    if (widthMatch && heightMatch) {
      const width = Math.round(parseFloat(widthMatch[1]));
      const height = Math.round(parseFloat(heightMatch[1]));
      if (width > 0 && height > 0) return { width, height };
    }
  }

  return null;
}

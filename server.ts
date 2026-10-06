import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTRACTED_MENU_PATH = path.join(__dirname, 'src', 'data', 'extractedMenu.json');
const CATEGORY_IMAGES_PATH = path.join(__dirname, 'src', 'data', 'categoryImages.json');
const SIGNATURE_ASSETS_JSON_PATH = path.join(__dirname, 'src', 'data', 'signatureAssets.json');

// Use the existing project asset folder: /src/assets/images
const SIGNATURES_ASSETS_DIR = path.join(__dirname, 'src', 'assets', 'images');

const SIGNATURE_SLUGS: Record<string, string> = {
  hero: 'hero-shangaas-cafe',
  'sig-1': 'beetroot-spinach-momos',
  'sig-2': 'signature-mocktails',
  'sig-3': 'makki-ki-roti-sarson-ka-saag',
  'sig-4': 'himachali-siddu',
};

const SIGNATURE_KEYWORDS: Record<string, string[]> = {
  hero: ['hero-shangaas-cafe', 'hero_background', 'hero-background', 'cafe-hero'],
  'sig-1': ['beetroot', 'spinach', 'momo'],
  'sig-2': ['mocktail'],
  'sig-3': ['makki', 'sarson', 'saag'],
  'sig-4': ['siddu', 'himachali'],
};

const LEGACY_AI_HERO_FILE = 'hero_shangaas_cafe_1791188557404.jpg';

const ALLOWED_EXTS = ['gif', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'svg'];

function ensureDirectories() {
  fs.mkdirSync(SIGNATURES_ASSETS_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(SIGNATURE_ASSETS_JSON_PATH), { recursive: true });
}

// Scans /src/assets/images/ for actual existing physical files and syncs /src/data/signatureAssets.json
function syncAndReadSignatureAssets(): {
  assets: Record<string, string>;
  verifiedFiles: Record<
    string,
    { exists: boolean; filePath: string; fileName: string; publicUrl: string; sizeBytes: number }
  >;
} {
  ensureDirectories();
  const assets: Record<string, string> = {
    hero: `/src/assets/images/${LEGACY_AI_HERO_FILE}`,
    'sig-1': '',
    'sig-2': '',
    'sig-3': '',
    'sig-4': '',
  };

  try {
    if (fs.existsSync(SIGNATURE_ASSETS_JSON_PATH)) {
      const raw = fs.readFileSync(SIGNATURE_ASSETS_JSON_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.assign(assets, parsed);
      }
    }
  } catch (err) {
    console.error('Error reading signatureAssets.json:', err);
  }

  // Also check if user dropped files directly into /src/assets/images/ with matching keywords
  let dirEntries: string[] = [];
  try {
    dirEntries = fs.readdirSync(SIGNATURES_ASSETS_DIR);
  } catch {
    dirEntries = [];
  }

  const verifiedFiles: Record<
    string,
    { exists: boolean; filePath: string; fileName: string; publicUrl: string; sizeBytes: number }
  > = {};

  let changed = false;

  for (const [id, slug] of Object.entries(SIGNATURE_SLUGS)) {
    let foundFileName = '';
    let foundSize = 0;

    // 1. Check exact canonical filename first: <slug>.<ext> in /src/assets/images/
    for (const ext of ALLOWED_EXTS) {
      const candidateName = `${slug}.${ext}`;
      const candidatePath = path.join(SIGNATURES_ASSETS_DIR, candidateName);
      if (fs.existsSync(candidatePath)) {
        const stat = fs.statSync(candidatePath);
        if (stat.isFile() && stat.size > 0) {
          foundFileName = candidateName;
          foundSize = stat.size;
          break;
        }
      }
    }

    // 2. If not found under exact slug, check if a real file in /src/assets/images/ matches this item
    if (!foundFileName) {
      const keywords = SIGNATURE_KEYWORDS[id] || [];
      for (const entry of dirEntries) {
        const lower = entry.toLowerCase();
        const ext = path.extname(lower).replace('.', '');
        if (!ALLOWED_EXTS.includes(ext)) continue;
        // Skip unrelated existing cafe images
        if (
          lower === LEGACY_AI_HERO_FILE ||
          lower.startsWith('story_cafe_craft') ||
          lower.startsWith('menu_')
        ) {
          continue;
        }
        const isKnownSignatureSlug = Object.values(SIGNATURE_SLUGS).some(
          (s) => s !== slug && lower.startsWith(s)
        );
        if (isKnownSignatureSlug) continue;

        const matchesKeyword = keywords.some((kw) => lower.includes(kw));
        // If id === 'hero' and user dropped any new custom image into /src/assets/images/ that isn't a signature dish
        const isNewCustomHeroImage =
          id === 'hero' &&
          !Object.values(SIGNATURE_KEYWORDS)
            .flat()
            .some((kw) => lower.includes(kw));

        if (matchesKeyword || isNewCustomHeroImage) {
          const fullPath = path.join(SIGNATURES_ASSETS_DIR, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isFile() && stat.size > 0) {
            const normalizedExt = ext === 'jpeg' ? 'jpg' : ext;
            const canonicalName = `${slug}.${normalizedExt}`;
            const canonicalPath = path.join(SIGNATURES_ASSETS_DIR, canonicalName);
            if (fullPath !== canonicalPath) {
              fs.copyFileSync(fullPath, canonicalPath);
            }
            if (id === 'hero') {
              try {
                fs.copyFileSync(
                  canonicalPath,
                  path.join(SIGNATURES_ASSETS_DIR, LEGACY_AI_HERO_FILE)
                );
              } catch {
                // ignore
              }
            }
            foundFileName = canonicalName;
            foundSize = stat.size;
            break;
          }
        }
      }
    }

    // 3. Fallback for hero if hero-shangaas-cafe.<ext> has not been uploaded yet
    if (!foundFileName && id === 'hero') {
      const legacyHeroPath = path.join(SIGNATURES_ASSETS_DIR, LEGACY_AI_HERO_FILE);
      if (fs.existsSync(legacyHeroPath)) {
        const stat = fs.statSync(legacyHeroPath);
        if (stat.isFile() && stat.size > 0) {
          foundFileName = LEGACY_AI_HERO_FILE;
          foundSize = stat.size;
        }
      }
    }

    if (foundFileName) {
      const assetUrl = `/src/assets/images/${foundFileName}`;
      if (assets[id] !== assetUrl) {
        assets[id] = assetUrl;
        changed = true;
      }
      verifiedFiles[id] = {
        exists: true,
        filePath: `/src/assets/images/${foundFileName}`,
        fileName: foundFileName,
        publicUrl: assetUrl,
        sizeBytes: foundSize,
      };
    } else {
      // Do not keep any non-existent local path in signatureAssets.json
      if (
        assets[id] &&
        (assets[id].startsWith('/src/assets/') || assets[id].startsWith('/assets/'))
      ) {
        assets[id] = '';
        changed = true;
      }
      verifiedFiles[id] = {
        exists: false,
        filePath: '',
        fileName: '',
        publicUrl: '',
        sizeBytes: 0,
      };
    }
  }

  if (changed) {
    writeSignatureAssets(assets);
  }

  return { assets, verifiedFiles };
}

function writeSignatureAssets(assets: Record<string, string>) {
  try {
    ensureDirectories();
    fs.writeFileSync(SIGNATURE_ASSETS_JSON_PATH, JSON.stringify(assets, null, 2) + '\n', 'utf-8');
  } catch (err) {
    console.error('Error writing signatureAssets.json:', err);
  }
}

function readPersistedMenu(): any[] {
  try {
    if (fs.existsSync(EXTRACTED_MENU_PATH)) {
      const raw = fs.readFileSync(EXTRACTED_MENU_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading persisted menu:', err);
  }
  return [];
}

function writePersistedMenu(items: any[]) {
  try {
    fs.mkdirSync(path.dirname(EXTRACTED_MENU_PATH), { recursive: true });
    fs.writeFileSync(EXTRACTED_MENU_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing persisted menu:', err);
  }
}

function readCategoryImages(): Record<string, string> {
  try {
    if (fs.existsSync(CATEGORY_IMAGES_PATH)) {
      const raw = fs.readFileSync(CATEGORY_IMAGES_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading category images:', err);
  }
  return {};
}

function writeCategoryImages(images: Record<string, string>) {
  try {
    fs.mkdirSync(path.dirname(CATEGORY_IMAGES_PATH), { recursive: true });
    fs.writeFileSync(CATEGORY_IMAGES_PATH, JSON.stringify(images, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing category images:', err);
  }
}

function mimeOrNameToExt(mimeType?: string, fileName?: string): string {
  const m = (mimeType || '').toLowerCase();
  if (m.includes('gif')) return 'gif';
  if (m.includes('png')) return 'png';
  if (m.includes('webp')) return 'webp';
  if (m.includes('svg')) return 'svg';
  if (m.includes('avif')) return 'avif';
  if (m.includes('jpeg') || m.includes('jpg')) return 'jpg';

  if (fileName) {
    const ext = path.extname(fileName).replace('.', '').toLowerCase();
    if (ALLOWED_EXTS.includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext;
    }
  }
  return 'gif';
}

function removeOtherExtensions(slug: string, keepFilePath: string) {
  for (const ext of ALLOWED_EXTS) {
    const candidate = path.join(SIGNATURES_ASSETS_DIR, `${slug}.${ext}`);
    if (candidate !== keepFilePath && fs.existsSync(candidate)) {
      try {
        fs.unlinkSync(candidate);
      } catch {
        // ignore
      }
    }
  }
}

async function startServer() {
  ensureDirectories();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '250mb' }));

  // Serve permanent assets directly from /src/assets/images in both dev and production
  app.use(
    '/src/assets/images',
    express.static(SIGNATURES_ASSETS_DIR, {
      etag: true,
      maxAge: 0,
    })
  );

  // Get verified permanent Signature Dish asset paths in /src/assets/images
  app.get('/api/signature-assets', (_req, res) => {
    const { assets, verifiedFiles } = syncAndReadSignatureAssets();
    res.json({ assets, verifiedFiles });
  });

  // Chunked binary upload endpoint for large animated GIFs / images
  // Writes directly to /src/assets/images/<slug>.<ext>
  app.post('/api/signature-assets/chunk', (req, res) => {
    try {
      const { id, chunkIndex, totalChunks, mimeType, fileName, chunkBase64 } = req.body as {
        id: string;
        chunkIndex: number;
        totalChunks: number;
        mimeType?: string;
        fileName?: string;
        chunkBase64: string;
      };

      const slug = SIGNATURE_SLUGS[id];
      if (!slug) {
        res.status(400).json({ error: 'Invalid signature item id' });
        return;
      }

      ensureDirectories();
      const ext = mimeOrNameToExt(mimeType, fileName);
      const partPath = path.join(SIGNATURES_ASSETS_DIR, `${slug}.${ext}.part`);
      const finalFileName = `${slug}.${ext}`;
      const finalFilePath = path.join(SIGNATURES_ASSETS_DIR, finalFileName);

      const buffer = Buffer.from(chunkBase64, 'base64');

      if (chunkIndex === 0) {
        fs.writeFileSync(partPath, buffer);
      } else {
        fs.appendFileSync(partPath, buffer);
      }

      if (chunkIndex + 1 === totalChunks) {
        removeOtherExtensions(slug, finalFilePath);
        fs.renameSync(partPath, finalFilePath);

        if (id === 'hero') {
          try {
            fs.copyFileSync(
              finalFilePath,
              path.join(SIGNATURES_ASSETS_DIR, LEGACY_AI_HERO_FILE)
            );
          } catch {
            // ignore
          }
        }

        const { assets, verifiedFiles } = syncAndReadSignatureAssets();
        const stableAssetPath = `/src/assets/images/${finalFileName}`;
        assets[id] = stableAssetPath;
        writeSignatureAssets(assets);

        res.json({
          ok: true,
          done: true,
          id,
          assetPath: stableAssetPath,
          filePath: `/src/assets/images/${finalFileName}`,
          fileName: finalFileName,
          sizeBytes: fs.statSync(finalFilePath).size,
          assets,
          verifiedFiles,
        });
      } else {
        res.json({
          ok: true,
          done: false,
          chunkIndex,
        });
      }
    } catch (error: any) {
      console.error('Error in chunked signature asset upload:', error);
      res.status(500).json({ error: error?.message || 'Chunk upload failed' });
    }
  });

  // Single-request upload or reset endpoint
  app.post('/api/signature-assets', (req, res) => {
    try {
      const { id, dataUrl, externalUrl, fileName: rawFileName } = req.body as {
        id: string;
        dataUrl?: string;
        externalUrl?: string;
        fileName?: string;
      };

      const slug = SIGNATURE_SLUGS[id];
      if (!slug) {
        res.status(400).json({ error: 'Invalid signature item id' });
        return;
      }

      ensureDirectories();

      // Clear/reset slot if both dataUrl and externalUrl are empty
      if (!dataUrl && !externalUrl) {
        removeOtherExtensions(slug, '');
        const { assets, verifiedFiles } = syncAndReadSignatureAssets();
        assets[id] = '';
        writeSignatureAssets(assets);
        res.json({ ok: true, id, assetPath: '', assets, verifiedFiles });
        return;
      }

      if (dataUrl && dataUrl.startsWith('data:')) {
        const marker = ';base64,';
        const markerIdx = dataUrl.indexOf(marker);
        if (markerIdx === -1) {
          res.status(400).json({ error: 'Malformed data URL' });
          return;
        }
        const mimeType = dataUrl.slice(5, markerIdx);
        const base64Data = dataUrl.slice(markerIdx + marker.length);
        const ext = mimeOrNameToExt(mimeType, rawFileName);
        const fileName = `${slug}.${ext}`;
        const filePath = path.join(SIGNATURES_ASSETS_DIR, fileName);

        removeOtherExtensions(slug, filePath);

        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);

        const { assets, verifiedFiles } = syncAndReadSignatureAssets();
        const stableAssetPath = `/src/assets/images/${fileName}`;
        assets[id] = stableAssetPath;
        writeSignatureAssets(assets);

        res.json({
          ok: true,
          id,
          assetPath: stableAssetPath,
          filePath: `/src/assets/images/${fileName}`,
          fileName,
          sizeBytes: fs.statSync(filePath).size,
          assets,
          verifiedFiles,
        });
        return;
      }

      if (externalUrl) {
        const { assets, verifiedFiles } = syncAndReadSignatureAssets();
        assets[id] = externalUrl.trim();
        writeSignatureAssets(assets);
        res.json({
          ok: true,
          id,
          assetPath: assets[id],
          assets,
          verifiedFiles,
        });
        return;
      }

      res.status(400).json({ error: 'No valid image payload provided' });
    } catch (error: any) {
      console.error('Error saving permanent signature asset:', error);
      res.status(500).json({ error: error?.message || 'Failed to save signature asset' });
    }
  });

  app.get('/api/menu', (_req, res) => {
    const items = readPersistedMenu();
    res.json({ items });
  });

  app.post('/api/save-menu', (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'Invalid items array' });
      return;
    }
    writePersistedMenu(items);
    res.json({ ok: true, count: items.length });
  });

  app.get('/api/category-images', (_req, res) => {
    const images = readCategoryImages();
    res.json({ images });
  });

  app.post('/api/category-images', (req, res) => {
    const { images } = req.body;
    if (!images || typeof images !== 'object') {
      res.status(400).json({ error: 'Invalid images map' });
      return;
    }
    writeCategoryImages(images);
    res.json({ ok: true });
  });

  app.post('/api/extract-menu-from-photos', async (req, res) => {
    try {
      const { photos, allowedCategories } = req.body as {
        photos: Array<{ imageUrl: string; title?: string }>;
        allowedCategories: string[];
      };

      if (!Array.isArray(photos) || photos.length === 0) {
        res.status(400).json({ error: 'No menu photos provided' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const imageParts = photos
        .map((photo) => {
          const marker = ';base64,';
          const idx = photo.imageUrl?.indexOf(marker) ?? -1;
          if (idx === -1) return null;
          return {
            inlineData: {
              mimeType: photo.imageUrl.slice(5, idx),
              data: photo.imageUrl.slice(idx + marker.length),
            },
          };
        })
        .filter((p): p is { inlineData: { mimeType: string; data: string } } => p !== null);

      if (imageParts.length === 0) {
        res.status(400).json({ error: 'No valid base64 image data found in photos' });
        return;
      }

      const promptText = `Read the uploaded original menu photographs for "The Shangaas Cafe" with 100% precision.
Extract EVERY single menu item and its EXACT price in the exact sequence/order shown in the menu photos.

STRICT RULES:
1. Do NOT invent, remove, rename, or modify any item or price.
2. Keep the exact dish names as written on the menu.
3. Keep the exact prices as written on the menu (format clearly with ₹, e.g. "₹149").
4. For items with two prices (such as ₹329/₹499), show both prices clearly as "₹329 / ₹499".
5. For items with Steam/Fried options (such as Momos), show both prices clearly as "Steam ₹189 | Fried ₹219".
6. Keep Veg and Non-Veg items clearly separated into their exact categories from this list:
${allowedCategories.join(', ')}

Return a JSON array of menu items in their exact sequence.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [...imageParts, { text: promptText }],
        },
        config: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: 'Exact category name from the provided list.',
                },
                name: {
                  type: Type.STRING,
                  description: 'Exact menu item name as shown in the menu photo.',
                },
                price: {
                  type: Type.STRING,
                  description:
                    'Exact price string formatted with ₹ (e.g. "₹149" or "₹329 / ₹499" or "Steam ₹189 | Fried ₹219").',
                },
              },
              required: ['category', 'name', 'price'],
            },
          },
        },
      });

      const rawText = response.text?.trim() || '[]';
      const extracted = JSON.parse(rawText);

      if (Array.isArray(extracted) && extracted.length > 0) {
        const formattedItems = extracted.map((row: any, idx: number) => ({
          id: `item-${idx + 1}-${Date.now()}`,
          category: row.category,
          name: row.name,
          price: String(row.price).includes('₹') ? String(row.price) : `₹${row.price}`,
        }));

        writePersistedMenu(formattedItems);
        res.json({ items: formattedItems });
      } else {
        res.status(422).json({ error: 'Could not extract menu items from the provided images.' });
      }
    } catch (error: any) {
      console.error('Error extracting menu from photos:', error);
      res.status(500).json({ error: error?.message || 'Failed to extract menu from photos' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

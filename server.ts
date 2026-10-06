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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

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
          const match = photo.imageUrl?.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
          if (!match) return null;
          return {
            inlineData: {
              mimeType: match[1],
              data: match[2],
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

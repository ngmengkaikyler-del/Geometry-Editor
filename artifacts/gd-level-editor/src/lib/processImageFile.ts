import type { CustomImage } from "../types";

let nextId = 1;

function generateId(): string {
  return `custom_${Date.now()}_${nextId++}`;
}

export function processImageFile(file: File): Promise<CustomImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.toLowerCase().startsWith("image/png")) {
      reject(new Error("Only PNG images are supported."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const id = generateId();
        const name = file.name.replace(/\.png$/i, "");
        resolve({ id, name, dataUrl, image: img });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

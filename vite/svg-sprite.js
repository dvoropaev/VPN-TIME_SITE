import svgSprite from 'svg-sprite';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Эмуляция __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  mode: {
    symbol: {
      sprite: 'sprite.svg',
      example: false,
    },
  },
  shape: {
    transform: [],
  },
  svg: {
    xmlDeclaration: false,
    doctypeDeclaration: false,
  },
};

const sprite = new svgSprite(config);

// Путь к svg-иконкам
const iconsDir = path.resolve(__dirname, '../src/icons');
const files = readdirSync(iconsDir).filter(file => file.endsWith('.svg'));

files.forEach(file => {
  const filePath = path.join(iconsDir, file);
  sprite.add(
    path.resolve(filePath),
    null,
    readFileSync(filePath, { encoding: 'utf-8' })
  );
});

sprite.compile((error, result) => {
  if (error) throw error;

  const spriteContent = result.symbol.sprite.contents;
  const outputPath = path.resolve(__dirname, '../dist/img/sprite.svg');
  
  // Создаём папку, если её нет
  mkdirSync(path.resolve(__dirname, '../dist/img'), { recursive: true });
  
  writeFileSync(outputPath, spriteContent);
  console.log('✅ SVG спрайт успешно сгенерирован в dist/img/sprite.svg!');
});
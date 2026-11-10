import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.resolve(__dirname, 'dist', 'index.html');
const assetsDir = path.resolve(__dirname, 'dist', 'assets');

if (!fs.existsSync(htmlPath)) {
  console.error('dist/index.html not found. Run npm run build first.');
  process.exit(1);
}

let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

const files = fs.readdirSync(assetsDir);
const cssFile = files.find((f) => f.endsWith('.css'));
const jsFile = files.find((f) => f.endsWith('.js'));

if (cssFile) {
  const cssPath = path.join(assetsDir, cssFile);
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  htmlContent = htmlContent.replace(
    new RegExp(`<link[^>]*href=["'][^"']*${cssFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i'),
    () => `<style>\n${cssContent}\n</style>`
  );
}

if (jsFile) {
  const jsPath = path.join(assetsDir, jsFile);
  let jsContent = fs.readFileSync(jsPath, 'utf-8');

  // Inline local image assets as base64 data URLs so standalone HTML has zero broken images
  const imgRelPath = 'src/assets/images/admission_eval_desk_1793872923871.jpg';
  const imgAbsPath = path.resolve(__dirname, imgRelPath);
  if (fs.existsSync(imgAbsPath)) {
    const imgB64 = fs.readFileSync(imgAbsPath).toString('base64');
    const dataUri = `data:image/jpeg;base64,${imgB64}`;
    jsContent = jsContent.split('/' + imgRelPath).join(dataUri);
  }

  // Prevent premature </script> closing inside HTML
  const safeJsContent = jsContent.replace(/<\/script/gi, '<\\/script');

  // Remove module script from <head> and place executable script at the end of <body>
  htmlContent = htmlContent.replace(
    new RegExp(`<script[^>]*src=["'][^"']*${jsFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*><\/script>`, 'i'),
    () => ''
  );

  htmlContent = htmlContent.replace(
    /<\/body>/i,
    () => `<script type="module">\n${safeJsContent}\n</script>\n</body>`
  );
}

const outRoot = path.resolve(__dirname, 'DentalPass_OriginalApp_Standalone.html');
fs.writeFileSync(outRoot, htmlContent, 'utf-8');

const publicDir = path.resolve(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, 'DentalPass_OriginalApp_Standalone.html'), htmlContent, 'utf-8');

console.log(
  `Successfully generated standalone HTML (${(Buffer.byteLength(htmlContent, 'utf-8') / 1024).toFixed(1)} KB)`
);

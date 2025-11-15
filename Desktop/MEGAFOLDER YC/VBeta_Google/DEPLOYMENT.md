# Deployment Guide

## 🚀 Deploying to Replit

This project is optimized for deployment on Replit as part of the Locus Agentic Payments Hackathon requirements.

### Option 1: Import from GitHub

1. Go to [Replit](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Paste your repository URL
5. Replit will automatically detect the configuration
6. Click "Import from GitHub"

### Option 2: Upload Files

1. Create a new Repl on Replit
2. Choose "Node.js" as the template
3. Upload all project files
4. The `.replit` file will be detected automatically

### Running on Replit

The application will start automatically when you click "Run". The `.replit` configuration file specifies:

```
run = "npm run dev"
```

This will:
1. Install dependencies automatically
2. Start the Vite development server
3. Open the application in the Replit webview

### Environment Variables (Optional)

If you need to add environment variables:

1. Click on "Secrets" (lock icon) in the left sidebar
2. Add your variables:
   - `VITE_LOCUS_API_KEY`
   - `VITE_ANTHROPIC_API_KEY`
   - etc.

3. Access them in your code:
```typescript
const apiKey = import.meta.env.VITE_LOCUS_API_KEY
```

---

## 🌐 Other Deployment Options

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts
4. Your app will be live at `your-app.vercel.app`

### Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)

Or use Netlify CLI:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages

1. Add to `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',
  server: {
    port: 3000,
    open: true
  }
})
```

2. Build:
```bash
npm run build
```

3. Deploy to `gh-pages` branch:
```bash
npm i -D gh-pages
npx gh-pages -d dist
```

4. Enable GitHub Pages in repository settings

---

## 🏗️ Production Build

To create an optimized production build:

```bash
npm run build
```

This will:
- Compile TypeScript
- Bundle with Vite
- Optimize for production
- Output to `dist/` directory

Preview the production build locally:

```bash
npm run preview
```

---

## 📊 Build Optimization

The production build includes:

- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Removes unused code
- **Minification**: JavaScript and CSS
- **Asset Optimization**: Images and fonts
- **Lazy Loading**: Components loaded on demand

---

## 🔒 Security Considerations

Before deploying to production:

1. **Environment Variables**: Never commit API keys
2. **CORS**: Configure allowed origins
3. **Rate Limiting**: Implement on API endpoints
4. **Authentication**: Add user authentication
5. **HTTPS**: Always use HTTPS in production

---

## 📈 Performance Monitoring

Consider adding:

- **Analytics**: Google Analytics, Plausible
- **Error Tracking**: Sentry, LogRocket
- **Performance**: Lighthouse CI
- **Uptime Monitoring**: UptimeRobot

---

## 🔄 CI/CD Pipeline

Example GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🐳 Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t locus-ai-marketplace .
docker run -p 80:80 locus-ai-marketplace
```

---

## 🎯 Deployment Checklist

Before deploying:

- [ ] Remove console.logs
- [ ] Update API endpoints to production URLs
- [ ] Configure environment variables
- [ ] Test all routes and functionality
- [ ] Run production build locally
- [ ] Check responsive design on all devices
- [ ] Verify SEO meta tags
- [ ] Test performance with Lighthouse
- [ ] Set up error monitoring
- [ ] Configure analytics
- [ ] Add favicon and PWA manifest
- [ ] Test cross-browser compatibility

---

## 📱 PWA Configuration (Optional)

To make this a Progressive Web App:

1. Add `vite-plugin-pwa`:
```bash
npm i -D vite-plugin-pwa
```

2. Update `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Locus AI Agent Marketplace',
        short_name: 'Locus AI',
        theme_color: '#4A69FF',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

---

## 🆘 Troubleshooting Deployment

**Build Fails:**
- Check Node.js version (needs 16+)
- Clear `node_modules` and reinstall
- Check for TypeScript errors

**Assets Not Loading:**
- Verify `base` path in `vite.config.ts`
- Check asset paths are relative
- Ensure `dist` folder is being deployed

**Routing Issues:**
- Configure server for SPA routing
- For Netlify: add `_redirects` file
- For Vercel: automatic SPA routing

---

**Need Help?** Check the [Replit Docs](https://docs.replit.com) or the project README.


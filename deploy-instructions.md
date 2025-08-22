# Deploy Atlas in Shopper to Netlify

## Option 1: Manual Drag & Drop Deployment

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `out` folder from this project
4. Your site will be deployed instantly!

## Option 2: GitHub Integration (Recommended)

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select your `atlas-in-shopper` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
   - **Node version**: `18`

## Option 3: Netlify CLI (if authentication works)

```bash
# Login to Netlify
npx netlify-cli login

# Deploy the site
npx netlify-cli deploy --dir=out --prod
```

## Build Configuration

The project is already configured with:
- `netlify.toml` configuration file
- Next.js static export enabled
- Build output in `out` directory

## Project Details

- **Project Name**: Atlas in Shopper
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Build Output**: Static HTML/CSS/JS files

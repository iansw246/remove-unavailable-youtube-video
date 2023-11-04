# Deployment
Run `pnpm build`

The minified and bundled AWS Lambda scripts will be in the dist folder.

Create a zip file with the contents of dist/. `index.js` must be at the root.

Upload the zip to Lambda.
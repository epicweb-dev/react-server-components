npx npm-check-updates --dep prod,dev --upgrade --root --reject react
cd epicshop && npx npm-check-updates --dep prod,dev --upgrade --root --reject react
cd ..
rm -rf node_modules package-lock.json ./epicshop/package-lock.json ./epicshop/node_modules ./exercises/**/node_modules
npm install
npm run setup
npm run lint -- --fix

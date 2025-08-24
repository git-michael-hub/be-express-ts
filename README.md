node 22.11.0

npm init -y // create package.json
npm install express
npm install --save-dev typescript ts-node nodemon @types/node @types/express
npx tsc --init // create tsconfig.json

nodemon.json // for hot reloading

"scripts": {
    "start": "node dist/main.js",
    "dev": "nodemon --watch src --exec ts-node ./src/main.ts", // watch code changes
    "build": "tsc" // compile code to dist/
},


file docker-compose.yml
// add to sync local files to the container
volumes:
  - .:/app
  - /app/node_modules



docker build -t be-expressjs-ts .
docker run -p 3000:3000 be-expressjs-ts

or 

docker compose up




DB

npm run migration:generate
npm run migration:run

seeder


Creation
- entity
- route
- swagger.ts from config


Swagger Docu
http://localhost:3000/api-docs/#/
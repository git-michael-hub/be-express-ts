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



docker build -t express-ts-app .
docker run -p 3000:3000 express-ts-app

or 

docker compose up




DB

migration generate
migation run

seeder
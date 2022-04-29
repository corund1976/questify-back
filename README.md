# questify-back

1. Express представляет свой генератор приложений
   $ npx express-generator --view=ejs my-app

2. Внутри папки с приложением установить пакеты, которые входят в базовый набор
   $ npm i

3. Для режима разработки установить пакет nodemon
   $ npm i nodemon -D

4. В package.json для запуска приложения в режиме разработки добавить скрипт start:dev
   "scripts": {
   "start": "node ./bin/www",
   "start:dev": "nodemon ./bin/www"
   },

5. Запуск приложения в режиме разработке будет следующим
   $ npm run start:dev

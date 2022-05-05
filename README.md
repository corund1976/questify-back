# questify-back

1. Express представляет свой генератор приложений
   $ npx express-generator --view=ejs questify-back

2. Внутри папки с приложением установить пакеты, которые входят в базовый набор
   $ cd questify-back
   $ npm install

3. Для режима разработки установить пакет nodemon
   $ npm i nodemon -D

4. В package.json для запуска приложения в режиме разработки добавить скрипт start:dev
   "scripts": {
   "start": "node ./bin/server.js",
   "start:dev": "nodemon ./bin/server.js"
   },

5. Запуск приложения в режиме разработке будет следующим
   $ npm run start:dev

6. Load http://localhost:3000/ in your browser to access the app

7. Генератор ориентируется на MVC архитектуру приложений и имеет следующую структуру каталогов:
   .
   ├── app.js
   ├── bin
   │ └── www(server.js)
   ├── package.json
   ├── public
   │ ├── images
   │ ├── javascripts
   │ └── stylesheets
   │ └── style.css
   ├── routes
   │ ├── index.js
   │ └── users.js
   └── views
   ├── error.pug
   ├── index.pug
   └── layout.pug

7 directories, 9 files

8. Деплой на Heroku
   git push heroku main

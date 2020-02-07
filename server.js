/* Подключение express - модуля работы с http/https */
const express = require('express');
const app = express();

// Настройки проекта хранятся в settings.json
const Settings = require('./settings.json');

// По запросу в корень раздавать статику из папки public/
app.use('/', express.static('public/'));

// Запустить сервер на порте Settings.PORT
app.listen(Settings.PORT, () => {
    console.log(`Server is up on :${Settings.PORT}`);
});
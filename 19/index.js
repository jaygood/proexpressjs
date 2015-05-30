
const express = require('express');
const superagent = require('superagent');
const consolidate = require('consolidate');

const app = express();

app.engine('html', consolidate.handlebars);
app.set('view engine', 'html');
app.set('views', `${__dirname}/views`);

app.use(express.static(`${__dirname}/public`));

const user = 'azat_co';
const story_slug = 'kazan';
const api_key = '';
const username = '';
const _token = '';

app.get('/', (req, res) => {
  superagent.get(`http://api.storify.com/v1/stories/${user}/${story_slug}`)
    .query({api_key, username, _token})
    .set({Accept: 'application/json'})
    .end((e, storifyResponse) => {
      console.log('e', e, '\n--------------------------------------------------\n');
      console.log('storify', storifyResponse.body.content, '\n--------------------------------------------------\n');
      if (e) return next(e);
      return res.render('index', storifyResponse.body.content);
    });
});

module.exports = app;
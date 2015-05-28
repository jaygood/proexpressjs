
const superagent = require('superagent');
const consolidate = require('consolidate');

const app = require('express')();

app.engine('html', consolidate.handlebars);
app.set('view engine', 'html');
app.set('views', `${__dirname}/views`);

app.use(epress.static(`${__dirname}/public`));

const user = 'azat_co';
const story_slug = 'kazan';
const api_key = '';
const username = '';
const _token = '';

app.get('/', (req, res) => {
  superagent.get(`http://api.storify.com/v1/stories/${user}/${story_slug}`);
});
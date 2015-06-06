const https = require('https');

const angelListClient = process.env.NODE_ENV === 'production' ?
  {id: process.env.ANGELLIST_CLIENT_ID, secret: process.env.ANGELLIST_CLIENT_SECRET} :
  {id: proces.env.ANGELLIST_CLIENT_ID_LOCAL, secret: process.env.ANGELLIST_CLIENT_SECRET_LOCAL};

module.exports = {
  angelList(req, res) {
    res.redirect(`https://angel.co/api/oauth/authorize?client_id=${angelListClient.id}&scope=email&response_type=code`);
  },
  angelListCallback(req, res, next) {
    let token;
    let buf = '';
    let data;
    let angelReq = https.request({
      host: 'angel.co',
      path: `/api/oauth/token?client_id=${angelListClient.id}&client_secret${angelListClient.secret}&code=${req.query.code}&grant_type=authorization_code`,
      port: 443,
      method: 'POST',
      headers: {
        'content-length': 0
      }
    }, (angelReq, angelRes) => {
      angelRes.on('data', buffer => buf += buffer);
      angelRes.on('end', () => {
        try {
          data = JSON.parse(buf.toString('utf-8'));
        } catch (e) {
          if (e) return next(e);
        }
        if (!data || !data.access_token) {
          return next(new Error('No data from AngelList'));
        }
        req.session.angelListAccessToken = token;
        if (token) {
          next();
        } else {
          next(new Error('No token from AngelList'));
        }

        angelReq.end();
        angelReq.on('error', (e) => {
          console.error(e);
          next(e);
        });
      });
    });
  },
  angelListLogin(req, res, next) {
    const token = req.session.angelListAccessToken;
    const httpsRequest = https.request({
      host: 'api.angel.co',
      path: `/1/me?access_token${token}`,
      port: 443,
      method: 'GET'
    }, (httpsResponse) => {
      let userBuffer = '';
      httpsResponse.on('data', buffer => userBuffer += buffer);
      httpsResponse.on('end', () => {
        try {
          data = JSON.parse(userBuffer.toString('utf-8'));
        } catch (e) {
          if (e) return next(e);
        }
        if (data) {
          req.angelProfile = data;
          next();
        } else {
          next(new Error('No data from AngelList'));
        }
      });
    });
    httpsRequest.end();
    httpsRequest.on('error', e => console.error(e));
  }
};

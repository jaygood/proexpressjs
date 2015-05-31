const express = require('express')
const mongoskin = require('mongoskin')
const bodyParser = require('body-parser')
const logger = require('logger')

const app = express()
const db = mongoskin.db('@localhost:27017/test', {safe: true})

app.set('port', process.env.port || 3000)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.param('collectionName', (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName)
  return next()
})

app.get('/', (req, res, next) => {
  res.send('please')
})

app.get('/collections/:collectionName', (req, res, next) => {
  req.collection.find({}, {limit: 1, sort: {'_id': -1}}).toArray((e, results) => {
    if (e) return next(e)
    res.send(results)
  })
})

app.post('/collections/:collectionName', (req, res, next) => {
  req.collection.insert(req.body, {}, (e, results) => {
    if (e) return next(e)
    res.send(results)
  })
})

app.get('/collections/:collectionName/:id', (req, res, next) => {
  req.collection.findById(req.params.id, (e, result) => {
    if (e) return next(e)
    res.send(result)
  })
})

app.put('/collections/:collectionName/:id', (req, res, next) => {
  req.collection.updateById(req.params.id, {$set: req.body}, {safe: true, multi: false}, (e, result) => {
    if (e) return next(e)
    res.send({msg: result === 1 ? 'success' : 'error'})
  })
})

app.delete('/collections/:collectionName/:id', (req, res, next) => {
  req.collection.removeById(req.params.id, (e, result) => {
    if (e) return next(e)
    res.send({msg: result === 1 ? 'success' : 'error'})
  })
})

module.exports = app;
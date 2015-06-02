const superagent = require('superagent');
const expect = require('expect.js');

describe('express rest api server', () => {
  let id
  it('posts an object', (done) => {
    superagent.post('http://localhost:3000/collections/test')
      .send({name: 'Jon', email: 'jon@some.co'})
      .end((e, res) => {
        expect(e).to.eql(null)
        expect(res.body.length).to.eql(1)
        expect(res.body[0]._id.length).to.eql(24)
        id = res.body[0]._id
        done()
      })
  })

  it('retrieves an object', (done) => {
    superagent.get(`http://localhost:3000/collections/test/${id}`)
      .end((e, res) => {
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body._id.length).to.eql(24)
        expect(res.body._id).to.eql(id)
        done()
      })
  })

  it('retrieves a collection', (done) => {
    superagent.get('http://localhost:3000/collections/test')
      .end((e, res) => {
        expect(e).to.eql(null)
        expect(res.body.length).to.be.above(0)
        expect(res.body.map(item => item._id)).to.contain(id)
        done()
      })
  })

  it('updates an object', (done) => {
    superagent.put(`http://localhost:3000/collections/test/${id}`)
      .send({name: 'Perter'})
      .end((e, res) => {
        expect(e).to.eql(null)
        expect(typeof res.body).to.eql('object')
        expect(res.body.msg).to.eql('success')
        done()
      })
  })
});
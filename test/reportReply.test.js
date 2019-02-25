const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Thread } = require('../models/Thread');
const { populateBoardCollection, populateThreadCollection, threads } = require('./database/populateDatabase');

beforeEach(populateBoardCollection);
beforeEach(populateThreadCollection);

describe('PUT /api/replies/:board', () => {
  it('should successfully turn the "reported" property from a specific reply to "true"', (done) => {
    /* eslint no-underscore-dangle: 0 */
    const threadId = threads[0]._id.toHexString();
    const replyId = threads[0].replies[0]._id.toHexString();
    const body = { thread_id: threadId, reply_id: replyId };

    request(app)
      .put('/api/replies/board1')
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.text).toBe('success');
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Thread.findById(threadId).then((thread) => {
          expect(thread.replies[0].reported).toBe(true);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error if trying to report a reply using a board that does not exist', (done) => {
    const threadId = threads[0]._id.toHexString();
    const replyId = threads[0].replies[0]._id.toHexString();
    const body = { thread_id: threadId, reply_id: replyId };

    request(app)
      .put('/api/replies/board3')
      .send(body)
      .expect(404)
      .expect((res) => {
        expect(res.text).toBe('The board "board3" doesn\'t exist.');
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Thread.findById(body.thread_id).then((thread) => {
          expect(thread.replies[0].reported).toBe(false);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error if trying to report a specific reply while the "thread_id" property is an empty string', (done) => {
    const replyId = threads[0].replies[0]._id.toHexString();
    const body = { thread_id: '', reply_id: replyId };

    request(app)
      .put('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The "thread_id" field is mandatory and it can\'t be an empty string.');
      })
      .end(done);
  });

  it('should return an error if trying to report a specific reply while providing an invalid "thread_id" property', (done) => {
    const replyId = threads[0].replies[0]._id.toHexString();
    const body = { thread_id: '123', reply_id: replyId };
    request(app)
      .put('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The provided thread id is invalid.');
      })
      .end(done);
  });

  it('should return an error if trying to report a specific reply while providing a non-existent "thread_id"', (done) => {
    const threadId = new ObjectID().toHexString();
    const replyId = threads[0].replies[0]._id.toHexString();
    const body = { thread_id: threadId, reply_id: replyId };

    request(app)
      .put('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe(`A thread with an id of "${body.thread_id}" doesn't exist.`);
      })
      .end(done);
  });

  it('should return an error if trying to report a specific reply that does not belong to the specified board', (done) => {
    const threadId = threads[0]._id.toHexString();
    const replyId = threads[0].replies[0]._id.toHexString();
    const body = { thread_id: threadId, reply_id: replyId };

    request(app)
      .put('/api/replies/board2')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The given thread does not belong to the "board2" board.');
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Thread.findById(body.thread_id).then((thread) => {
          expect(thread.replies[0].reported).toBe(false);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error if trying to report a specific reply while providing an empty string for the "reply_id" property', (done) => {
    const threadId = threads[0]._id.toHexString();
    const body = { thread_id: threadId, reply_id: '' };

    request(app)
      .put('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The "reply_id" field is mandatory and it can\'t be an empty string.');
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Thread.findById(body.thread_id).then((thread) => {
          expect(thread.replies[0].reported).toBe(false);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error if trying to report a specific reply while providing an invalid value for the "reply_id" property', (done) => {
    const threadId = threads[0]._id.toHexString();
    const body = { thread_id: threadId, reply_id: '123' };

    request(app)
      .put('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The provided reply id is invalid.');
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Thread.findById(body.thread_id).then((thread) => {
          expect(thread.replies[0].reported).toBe(false);
          done();
        }).catch(error => done(error));
      });
  });
});

const expect = require('expect');
const request = require('supertest');
const moment = require('moment-timezone');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Thread } = require('../models/Thread');
const { populateBoardCollection, populateThreadCollection, threads } = require('./database/populateDatabase');

beforeEach(populateBoardCollection);
beforeEach(populateThreadCollection);

describe('PUT /api/threads/:board', () => {
  it('should successfully turn the "reported" property from the thread to "true"', (done) => {
    const threadId = threads[0]._id.toHexString();
    const body = { thread_id: threadId };

    request(app)
      .put('/api/threads/board1')
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.text).toBe('success');
      })
      .end((err) => {
        if(err){
          return done(err);
        }

        Thread.findById(threadId).then((thread) => {
          expect(thread.reported).toBe(true);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error if trying to report a thread using a board that does not exist', (done) => {
    const body = { thread_id: threads[0]._id.toHexString() };

    request(app)
      .put('/api/threads/board3')
      .send(body)
      .expect(404)
      .expect((res) => {
        expect(res.text).toBe('The board "board3" doesn\'t exist.');
      })
      .end((err) => {
        if(err){
          return done(err);
        }

        Thread.findById(body['thread_id']).then((thread) => {
          expect(thread.reported).toBe(false);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error if trying to report a specific thread while the "thread_id" property is an empty string', (done) => {
    const body = { thread_id: '' };
    request(app)
      .put('/api/threads/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The "thread_id" field is mandatory and it can\'t be an empty string.');
      })
      .end(done);
  });

  it('should return an error if trying to report a specific thread while providing an invalid "thread_id" property', (done) => {
    const body = { thread_id: '123' };
    request(app)
      .put('/api/threads/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The provided thread id is invalid.');
      })
      .end(done);
  });

  it('should return an error if trying to report a specific thread while providing a non-existent "thread_id"', (done) => {
    const body = { thread_id: new ObjectID().toHexString() };
    request(app)
      .put('/api/threads/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe(`A thread with an id of "${body['thread_id']}" doesn't exist.`);
      })
      .end(done);
  });

  it('should return an error if trying to report a specific thread that does not belong to the specified board', (done) => {
    const body = { thread_id: threads[0]._id.toHexString() };
    request(app)
      .put('/api/threads/board2')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The given thread does not belong to the "board2" board.');
      })
      .end((err) => {
        if(err){
          return done(err);
        }

        Thread.findById(body['thread_id']).then((thread) => {
          expect(thread.reported).toBe(false);
          done();
        }).catch(error => done(error));
      });
  });
});
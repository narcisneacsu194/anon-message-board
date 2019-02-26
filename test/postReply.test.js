const expect = require('expect');
const request = require('supertest');
const moment = require('moment-timezone');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { Thread } = require('../models/Thread');
const { populateBoardCollection, populateThreadCollection, threads } = require('./database/populateDatabase');

beforeEach(populateBoardCollection);
beforeEach(populateThreadCollection);

describe('POST /api/replies/:board', () => {
  it('should successfully create a reply for a specfic thread', (done) => {
    /* eslint no-underscore-dangle: 0 */
    const body = {
      text: 'reply3',
      delete_password: 'password4',
      thread_id: threads[0]._id.toHexString(),
    };

    const timestamp = moment(Date.now()).format('ddd MMM DD YYYY hh:mm');

    request(app)
      .post('/api/replies/board1')
      .send(body)
      .expect(200)
      .expect((res) => {
        const resBody = res.body;
        const createdOn = moment(resBody.created_on).format('ddd MMM DD YYYY hh:mm');
        const bumpedOn = moment(resBody.bumped_on).format('ddd MMM DD YYYY hh:mm');
        const thirdReply = resBody.replies[2];
        const replyCreatedOn = moment(thirdReply.created_on).format('ddd MMM DD YYYY hh:mm');
        expect(resBody.boardName).toBe('board1');
        expect(resBody.text).toBe('thread1');
        expect(createdOn).toBe(timestamp);
        expect(bumpedOn).toBe(timestamp);
        expect(resBody.replies.length).toBe(3);
        expect(resBody.replies[2].text).toBe('reply3');
        expect(replyCreatedOn).toBe(timestamp);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Thread.findById(threads[0]._id.toHexString()).then((thread) => {
          const { replies } = thread;
          const dbThirdReply = replies[2];
          const dbCreatedOn = moment(dbThirdReply.created_on).format('ddd MMM DD YYYY hh:mm');
          expect(replies.length).toBe(3);
          expect(dbThirdReply.reported).toBeFalsy();
          expect(dbThirdReply.text).toBe('reply3');
          expect(dbCreatedOn).toBe(timestamp);
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error if trying to create a reply within a board that does not exist', (done) => {
    const body = {
      text: 'reply3',
      delete_password: 'password4',
      thread_id: threads[0]._id.toHexString(),
    };
    request(app)
      .post('/api/replies/board3')
      .send(body)
      .expect(404)
      .expect((res) => {
        expect(res.text).toBe('The board "board3" doesn\'t exist.');
      })
      .end(done);
  });

  it('should return an error if trying to create a reply using an empty string for the "thread_id" property', (done) => {
    const body = {
      text: 'reply3',
      delete_password: 'password4',
      thread_id: '',
    };
    request(app)
      .post('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The "thread_id" field is mandatory and it can\'t be an empty string.');
      })
      .end(done);
  });

  it('should return an error if trying to create a reply using an invalid "thread_id" property value', (done) => {
    const body = {
      text: 'reply3',
      delete_password: 'password4',
      thread_id: '123',
    };
    request(app)
      .post('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The provided thread id is invalid.');
      })
      .end(done);
  });

  it('should return an error if trying to create a reply using a "thread_id" that doesn\'t belong to any thread', (done) => {
    const body = {
      text: 'reply3',
      delete_password: 'password4',
      thread_id: new ObjectID().toHexString(),
    };
    request(app)
      .post('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe(`A thread with an id of "${body.thread_id}" doesn't exist.`);
      })
      .end(done);
  });

  it('should return an error if trying to create a reply for a thread that doesn\'t belong to the specified board', (done) => {
    const body = {
      text: 'reply3',
      delete_password: 'password4',
      thread_id: threads[0]._id.toHexString(),
    };
    request(app)
      .post('/api/replies/board2')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The given thread does not belong to the "board2" board.');
      })
      .end(done);
  });

  it('should return an error if trying to create a reply using an empty string for the "text" property', (done) => {
    const body = {
      text: '',
      delete_password: 'password4',
      thread_id: threads[0]._id.toHexString(),
    };
    request(app)
      .post('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The text of the reply is mandatory and it can\'t be an empty string.');
      })
      .end(done);
  });

  it('should return an error if trying to create a reply using an empty string for the "delete_password" property', (done) => {
    const body = {
      text: 'Reply 100',
      delete_password: '',
      thread_id: threads[0]._id.toHexString(),
    };
    request(app)
      .post('/api/replies/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The password property is mandatory and it can\'t be an empty string.');
      })
      .end(done);
  });
});

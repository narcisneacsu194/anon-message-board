const expect = require('expect');
const request = require('supertest');
const moment = require('moment-timezone');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { app } = require('../server');
const { populateBoardCollection, populateThreadCollection, threads } = require('./database/populateDatabase');

beforeEach(populateBoardCollection);
beforeEach(populateThreadCollection);

describe('GET /api/replies/:board', () => {
  it('should successfully return the details of a specific thread and all of its replies', (done) => {
    /* eslint no-underscore-dangle: 0 */
    const threadId = threads[0]._id.toHexString();
    const timestamp = moment(Date.now()).format('ddd MMM DD YYYY hh:mm');
    request(app)
      .get(`/api/replies/board1?thread_id=${threadId}`)
      .expect(200)
      .expect((res) => {
        const thread = res.body;
        const createdOn = moment(thread.created_on).format('ddd MMM DD YYYY hh:mm');
        const bumpedOn = moment(thread.bumped_on).format('ddd MMM DD YYYY hh:mm');
        expect(thread.boardName).toBe('board1');
        expect(thread.text).toBe('thread1');
        expect(createdOn).toBe(timestamp);
        expect(bumpedOn).toBe(timestamp);

        const newReplies = _.reverse(thread.replies);

        newReplies.forEach((reply, replyIndex) => {
          const actualReplyCreatedOn = moment(reply.created_on).format('ddd MMM DD YYYY hh:mm');
          const expectedReply = threads[0].replies[replyIndex];
          const expectedReplyCreatedOn = moment(expectedReply.created_on).format('ddd MMM DD YYYY hh:mm');
          expect(reply.text).toBe(expectedReply.text);
          expect(actualReplyCreatedOn).toBe(expectedReplyCreatedOn);
        });
      })
      .end(done);
  });

  it('should return an error if trying to retrieve the details of a specific thread using a board that does not exist', (done) => {
    const threadId = threads[0]._id.toHexString();
    request(app)
      .get(`/api/replies/board3?thread_id=${threadId}`)
      .expect(404)
      .expect((res) => {
        expect(res.text).toBe('The board "board3" doesn\'t exist.');
      })
      .end(done);
  });

  it('should return an error if trying to retrieve details of a thread without providing the "thread_id" property', (done) => {
    request(app)
      .get('/api/replies/board1')
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The "thread_id" field is mandatory and it can\'t be an empty string.');
      })
      .end(done);
  });

  it('should return an error if trying to retrieve details of a thread using an invalid "thread_id" property', (done) => {
    request(app)
      .get('/api/replies/board1?thread_id=123')
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The provided thread id is invalid.');
      })
      .end(done);
  });

  it('should return an error if trying to retrieve details of a thread using a "thread_id" that does not exist', (done) => {
    const threadId = new ObjectID().toHexString();

    request(app)
      .get(`/api/replies/board1?thread_id=${threadId}`)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe(`A thread with an id of "${threadId}" doesn't exist.`);
      })
      .end(done);
  });

  it('should return an error if trying to retrieve the details of a thread that does not belong to the specified board', (done) => {
    const threadId = threads[0]._id.toHexString();

    request(app)
      .get(`/api/replies/board2?thread_id=${threadId}`)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The given thread does not belong to the "board2" board.');
      })
      .end(done);
  });
});

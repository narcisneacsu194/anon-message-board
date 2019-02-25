const expect = require('expect');
const request = require('supertest');
const moment = require('moment-timezone');
const _ = require('lodash');
const { app } = require('../server');
const { populateBoardCollection, populateThreadCollection, threads } = require('./database/populateDatabase');

beforeEach(populateBoardCollection);
beforeEach(populateThreadCollection);

describe('GET /api/threads/:board', () => {
  it('should successfully return a list of all the threads from a board', (done) => {
    request(app)
      .get('/api/threads/board1')
      .expect(200)
      .expect((res) => {
        const timestamp = moment(Date.now()).format('ddd MMM DD YYYY hh:mm');
        const { body } = res;
        body.forEach((thread, index) => {
          const createdOn = moment(thread.created_on).format('ddd MMM DD YYYY hh:mm');
          const bumpedOn = moment(thread.bumped_on).format('ddd MMM DD YYYY hh:mm');

          expect(thread.boardName).toBe('board1');
          expect(thread.text).toBe(threads[index].text);
          expect(createdOn).toBe(timestamp);
          expect(bumpedOn).toBe(timestamp);

          const newReplies = _.reverse(thread.replies);

          newReplies.forEach((reply, replyIndex) => {
            const localReply = threads[index].replies[replyIndex];
            const localReplyCreatedOn = moment(localReply.created_on)
              .format('ddd MMM DD YYYY hh:mm');
            const reqReplyCreatedOn = moment(reply.created_on)
              .format('ddd MMM DD YYYY hh:mm');

            expect(reply.text).toBe(localReply.text);
            expect(reqReplyCreatedOn).toBe(localReplyCreatedOn);
          });
        });
      })
      .end(done);
  });

  it('should return an error if the provided board doesn\'t exist.', (done) => {
    request(app)
      .get('/api/threads/board3')
      .expect(404)
      .expect((res) => {
        expect(res.text).toBe('The board \'board3\' doesn\'t exist.');
      })
      .end(done);
  });
});

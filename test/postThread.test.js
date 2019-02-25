const expect = require('expect');
const request = require('supertest');
const moment = require('moment-timezone');
const { app } = require('../server');
const { Board } = require('../models/Board');
const { Thread } = require('../models/Thread');
const { populateBoardCollection, populateThreadCollection } = require('./database/populateDatabase');

beforeEach(populateBoardCollection);
beforeEach(populateThreadCollection);

describe('POST /api/threads/:board', () => {
  it('should successfully create a thread for an existing board', (done) => {
    const body = {
        text: 'The Thread',
        delete_password: 'password2'
    };
    const timestamp = moment(Date.now()).format('ddd MMM DD YYYY hh:mm');

    request(app)
     .post('/api/threads/board1')
     .send(body)
     .expect(200)
     .expect((res) => {
       const body = res.body;
       const createdOn = moment(body['created_on']).format('ddd MMM DD YYYY hh:mm');
       const bumpedOn = moment(body['bumped_on']).format('ddd MMM DD YYYY hh:mm');
       expect(body.boardName).toBe('board1');
       expect(body.text).toBe('The Thread');
       expect(createdOn).toBe(timestamp);
       expect(bumpedOn).toBe(timestamp);
       expect(body.replies.length).toBe(0);
     }).end((err) => {
        if(err){
          return done(err);
        }

        Thread.findOne({ text: 'The Thread' }).then((thread) => {
          const dbCreatedOn = moment(thread['created_on'])
            .format('ddd MMM DD YYYY hh:mm');
          const dbBumpedOn = moment(thread['bumped_on'])
            .format('ddd MMM DD YYYY hh:mm');
          expect(thread.reported).toBeFalsy();
          expect(thread.text).toBe('The Thread');
          expect(dbCreatedOn).toBe(timestamp);
          expect(dbBumpedOn).toBe(timestamp);
          expect(thread.replies.length).toBe(0);
          expect(thread.boardName).toBe('board1');
          done();
        }).catch(error => done(error));
     });
  });

  it('should create a new board when using a name that does not exist in the database', (done) => {
    const body = {
        text: 'The Thread',
        delete_password: 'password2'
    };
    request(app)
      .post('/api/threads/board2')
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.boardName).toBe('board2');
      })
      .end((err) => {
        if(err){
          return done(err);
        }

        return Board.findOne({ name: 'board2' }).then((board) => {
          expect(board).toBeTruthy();
          expect(board.name).toBe('board2');
         
          return Thread.findOne({ text: 'The Thread' });
        }).then((thread) => {
          expect(thread.boardName).toBe('board2');
          done();
        }).catch(error => done(error));
      });
  });

  it('should return an error if trying to create a new thread without providing the "text" property', (done) => {
    const body = {
        text: '',
        delete_password: 'password2'
    };

    request(app)
      .post('/api/threads/board1')
      .send(body)
      .expect(400)
      .expect((res) => {
        expect(res.text).toBe('The text of the thread is mandatory and it can\'t be an an empty string.');
      })
      .end(done);
  });

  it('should return an error if trying to create a new thread without providing the "delete_password" property', (done) => {
    const body = {
      text: 'The Thread',
      delete_password: ''
    };

    request(app)
     .post('/api/threads/board1')
     .send(body)
     .expect(400)
     .expect((res) => {
       expect(res.text).toBe('The password of the thread is mandatory and it can\'t be an empty string.');
     })
     .end((err) => {
       if(err){
         return done(err);
       }

       Thread.findOne({ text: 'The Thread' }).then((thread) => {
         expect(thread).toBeFalsy();
         done();
       }).catch(error => done(error));
     });
  });
});
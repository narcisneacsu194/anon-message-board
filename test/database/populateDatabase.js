const { ObjectID } = require('mongodb');
const { Board } = require('../../models/Board');
const { Thread } = require('../../models/Thread');
const date = Date.now();

const boards = [
  {
    _id: new ObjectID(),
    name: 'board1'
  }
];

const threads = [
  {
    _id: new ObjectID(),
    text: 'thread1',
    created_on: date,
    bumped_on: date,
    delete_password: 'password2',
    replies: [
        {
            text: 'reply1',
            created_on: date,
            delete_password: 'password3'
        },
        {
            text: 'reply2',
            created_on: date,
            delete_password: 'password3'
        }
    ]
  },
  {
    _id: new ObjectID(),
    text: 'thread2',
    created_on: date,
    bumped_on: date,
    delete_password: 'password2',
    replies: [
        {
            text: 'reply3',
            created_on: date,
            delete_password: 'password3'
        },
        {
            text: 'reply4',
            created_on: date,
            delete_password: 'password3'
        }
    ]
  }
];

const populateBoardCollection = (done) => {
  Board.deleteMany({}).then(() => {
    Board.insertMany(boards).then(() => done());
  });
};

const populateThreadCollection = (done) => {
  Thread.deleteMany({}).then(() => {
    Thread.insertMany(threads).then(() => done());
  });
};

module.exports = {
  populateBookCollection, populateCommentCollection, boards, threads
};

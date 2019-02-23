const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
require('./config/config.js');
require('./db/mongoose');
const { Thread } = require('./models/Thread');
const { Board } = require('./models/Board');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(helmet.dnsPrefetchControl());

app.post('/api/threads/:board', async (req, res) => {
    const { text, delete_password } = req.body;

    if(!text || text.trim() === ''){
      return res.status(400).send('The text of the thread is mandatory and it can\'t be an an empty string.');
    }

    if(!delete_password || delete_password.trim() === ''){
        return res.status(400).send('The password of the thread is mandatory and it can\'t be an empty string.');
    }

    const boardName = req.params.board;
    const createdOn = Date.now();

    const dbBoard = await Board.findOne({ name: boardName });
    if(!dbBoard){
      const board = new Board({ name: boardName });
      await board.save();
    }
    
    const thread = new Thread({
        text: text.trim(),
        created_on: createdOn,
        bumped_on: createdOn,
        reported: false,
        delete_password: delete_password.trim(),
        replies: [],
        boardName
    });

    let dbThread = await thread.save();
    
    dbThread = _.pick(dbThread, ['boardName', 'text', 'created_on', 'bumped_on', 'replies']);

    return res.send(dbThread);
});

app.post('/api/replies/:board', async (req, res) => {
  const { text, delete_password, thread_id } = req.body;
  const boardName = req.params.board;

  const dbBoard = await Board.findOne({ name: boardName });
  if(!dbBoard){
    return res.status(400).send(`The board ${boardName} does not exist.`);
  }

  if(!text || text.trim() === ''){
    return res.status(400).send('The text of the reply is mandatory and it can\'t be an empty string.');
  }

  if(!delete_password || delete_password.trim() === ''){
    return res.status(400).send('The password of the reply is mandatory and it can\'t be an empty string.');
  }

  if(!thread_id || thread_id.trim() === ''){
    return res.status(400).send('The thread_id field is mandatory and it can\'t be an empty string.');
  }

  const thread = await Thread.findById(thread_id);
  if(!thread){
    return res.status(400).send(`The provided thread does not exist.`);
  }

  if(thread.boardName !== boardName){
    return res.status(400).send(`The provided thread does not belong to the ${boardName} board.`);
  }

  const date = Date.now();
  thread.bumped_on = date;
  const reply = { 
    text,
    created_on: date,
    delete_password,
    reported: false
  };

  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(reply['delete_password'], salt);
  reply['delete_password'] = hash;

  thread.replies.push(reply);
  
  let dbThread = await thread.save();
  let replies = dbThread.replies;
  replies = replies.map(reply => _.pick(reply, ['text', 'created_on']));

  dbThread = _.pick(dbThread, ['boardName', 'text', 'created_on', 'bumped_on', 'replies']);
  dbThread.replies = replies;

  return res.send(dbThread);
});

app.get('/api/threads/:board', async (req, res) => {

  const board = await Board.find({ name: req.params.board });
  if(!board){
    return res.status(404).send(`The board '${ req.params.board }' doesn't exist.`);
  }

  let threads = await Thread.find({ boardName: req.params.board }).sort({ bumped_on: -1 }).limit(10);

  threads = threads.map(thread => {
    let replies = thread.replies;
    replies = _.takeRight(replies, 3);
    replies = _.reverse(replies);
    replies = replies.map(reply => _.pick(reply, ['text', 'created_on']));
    let newThread = _.pick(thread, ['boardName', 'text', 'created_on', 'bumped_on', 'replies']);
    newThread.replies = replies;
    return newThread;
  });

  return res.send(threads);
});

app.get('/api/replies/:board', async (req, res) => {
  const board = await Board.find({ name: req.params.board });
  if(!board){
    return res.status(404).send(`The board '${ req.params.board }' doesn't exist.`);
  }

  const threadId = req.query['thread_id'];

  if(!threadId){
    return res.status(404).send('You must provide a thread_id query parameter.');
  }

  let thread = await Thread.findById(threadId);
  if(thread.boardName !== board.name){
    return res.status(400).send(`The provided thread does not belong to the ${board.name} board.`);
  }

  let replies = thread.replies;
  replies = _.reverse(replies);
  replies = replies.map(reply => _.pick(reply, ['text', 'created_on']));
  let newThread = _.pick(thread, ['boardName', 'text', 'created_on', 'bumped_on', 'replies']);
  newThread.replies = replies;

  return res.send(newThread);
});

app.listen(port, () => {
    console.log(`Server started up on port ${port}`);
});
  
module.exports = { app };
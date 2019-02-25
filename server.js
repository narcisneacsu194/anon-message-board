const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
require('./config/config.js');
require('./db/mongoose');
const { Thread } = require('./models/Thread');
const { Board } = require('./models/Board');
const { validateInput } = require('./validation/validation');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(helmet.dnsPrefetchControl());

app.post('/api/threads/:board', async (req, res) => {
  /* eslint camelcase: 0 */
  const { text, delete_password } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).send('The text of the thread is mandatory and it can\'t be an an empty string.');
  }

  if (!delete_password || delete_password.trim() === '') {
    return res.status(400).send('The password of the thread is mandatory and it can\'t be an empty string.');
  }

  const boardName = req.params.board;
  const createdOn = Date.now();

  const dbBoard = await Board.findOne({ name: boardName });
  if (!dbBoard) {
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
    boardName,
  });

  let dbThread = await thread.save();

  dbThread = _.pick(dbThread, ['boardName', 'text', 'created_on', 'bumped_on', 'replies']);

  return res.send(dbThread);
});

app.post('/api/replies/:board', async (req, res) => {
  const { text, delete_password, thread_id } = req.body;
  const boardName = req.params.board;

  const result = await validateInput('post', 'thread', {
    boardName,
    thread_id,
    text,
    delete_password,
  }, res);

  if (!result.text) {
    return result;
  }

  const date = Date.now();
  result.bumped_on = date;
  const reply = {
    text: text.trim(),
    created_on: date,
    delete_password: delete_password.trim(),
    reported: false,
  };

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(reply.delete_password, salt);
  reply.delete_password = hash;

  result.replies.push(reply);

  let dbThread = await result.save();
  let { replies } = dbThread;
  replies = replies.map(currentReply => _.pick(currentReply, ['text', 'created_on']));

  dbThread = _.pick(dbThread, ['boardName', 'text', 'created_on', 'bumped_on', 'replies']);
  dbThread.replies = replies;

  return res.send(dbThread);
});

app.get('/api/threads/:board', async (req, res) => {
  const board = await Board.findOne({ name: req.params.board });
  if (!board) {
    return res.status(404).send(`The board '${req.params.board}' doesn't exist.`);
  }

  let threads = await Thread.find({ boardName: board.name }).sort({ bumped_on: -1 }).limit(10);

  threads = threads.map((thread) => {
    let { replies } = thread;
    replies = _.takeRight(replies, 3);
    replies = _.reverse(replies);
    replies = replies.map(reply => _.pick(reply, ['text', 'created_on']));
    const newThread = _.pick(thread, ['boardName', 'text', 'created_on', 'bumped_on', 'replies']);
    newThread.replies = replies;
    return newThread;
  });

  return res.send(threads);
});

app.get('/api/replies/:board', async (req, res) => {
  const result = await validateInput('get', 'thread', {
    boardName: req.params.board,
    thread_id: req.query.thread_id,
  }, res);

  if (!result.text) {
    return result;
  }

  let { replies } = result;
  replies = _.reverse(replies);
  replies = replies.map(reply => _.pick(reply, ['text', 'created_on']));
  const responseThread = _.pick(result, ['boardName', 'text', 'created_on', 'bumped_on', 'replies']);
  responseThread.replies = replies;

  return res.send(responseThread);
});

app.delete('/api/threads/:board', async (req, res) => {
  const { thread_id, delete_password } = req.body;

  const result = await validateInput('delete', 'thread', {
    boardName: req.params.board,
    thread_id,
    delete_password,
  }, res);

  if (!result.text) {
    return result;
  }

  return bcrypt.compare(delete_password, result.delete_password, async (err, compareRes) => {
    if (compareRes) {
      await result.delete();
      return res.send('success');
    }

    return res.send('incorrect password');
  });
});

app.delete('/api/replies/:board', async (req, res) => {
  const { thread_id, reply_id, delete_password } = req.body;

  const result = await validateInput('delete', 'reply', {
    boardName: req.params.board,
    thread_id,
    reply_id,
    delete_password,
  }, res);

  if (!result.text) {
    return result;
  }

  const { replies } = result;
  /* eslint no-underscore-dangle: 0 */
  const filteredReplies = replies.filter(reply => reply._id.toHexString() === reply_id);
  const replyToBeDeleted = filteredReplies[0];

  return bcrypt.compare(delete_password,
    replyToBeDeleted.delete_password, async (err, compareRes) => {
      if (compareRes) {
        const finalReplies = replies.map((reply) => {
          const newReply = reply;
          if (reply._id.toHexString() === reply_id) {
            newReply.text = '[deleted]';
          }

          return newReply;
        });

        result.replies = finalReplies;
        await result.save();
        return res.send('success');
      }

      return res.send('incorrect password');
    });
});

app.put('/api/threads/:board', async (req, res) => {
  const { thread_id } = req.body;

  const result = await validateInput('put', 'thread', {
    boardName: req.params.board,
    thread_id,
  }, res);

  if (!result.text) {
    return result;
  }

  result.reported = true;
  await result.save();
  return res.send('success');
});

app.put('/api/replies/:board', async (req, res) => {
  const { thread_id, reply_id } = req.body;

  const result = await validateInput('put', 'reply', {
    boardName: req.params.board,
    thread_id,
    reply_id,
  }, res);

  if (!result.text) {
    return result;
  }

  const trimmedReplyId = reply_id.trim();

  result.replies = result.replies.map((reply) => {
    const newReply = reply;
    if (reply._id.toHexString() === trimmedReplyId) {
      newReply.reported = true;
    }

    return newReply;
  });

  await result.save();
  return res.send('success');
});

app.listen(port, () => {
  /* eslint no-console: 0 */
  console.log(`Server started up on port ${port}`);
});

module.exports = { app };

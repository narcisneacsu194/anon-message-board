const { ObjectID } = require('mongodb');
const { Board } = require('../models/Board');
const { Thread } = require('../models/Thread');

const validateInput = async (action, entityType, input, res) => {
  const board = await Board.findOne({ name: input.boardName });
  if (!board) {
    return res.status(404).send(`The board "${input.boardName}" doesn't exist.`);
  }

  if (!input.thread_id || input.thread_id.trim() === '') {
    return res.status(400).send('The "thread_id" field is mandatory and it can\'t be an empty string.');
  }

  /* eslint no-param-reassign: 0 */
  input.thread_id = input.thread_id.trim();

  if (!ObjectID.isValid(input.thread_id)) {
    return res.status(400).send('The provided thread id is invalid.');
  }

  const thread = await Thread.findById(input.thread_id);

  if (!thread) {
    return res.status(400).send(`A thread with an id of "${input.thread_id}" doesn't exist.`);
  }

  if (thread.boardName !== input.boardName) {
    return res.status(400).send(`The given thread does not belong to the "${input.boardName}" board.`);
  }

  if (entityType === 'reply') {
    if (!input.reply_id || input.reply_id.trim() === '') {
      return res.status(400).send('The "reply_id" field is mandatory and it can\'t be an empty string.');
    }

    input.reply_id = input.reply_id.trim();

    if (!ObjectID.isValid(input.reply_id)) {
      return res.status(400).send('The provided reply id is invalid.');
    }

    const returnedReply = thread.replies.filter(arrReply => arrReply._id.toHexString() === input.reply_id);

    if(returnedReply.length !== 1){
      return res.status(400).send(`A reply with an id of "${input.reply_id}" doesn't exist.`);
    }
  }

  if (action === 'post') {
    if (!input.text || input.text.trim() === '') {
      return res.status(400).send('The text of the reply is mandatory and it can\'t be an empty string.');
    }
  }

  if (action === 'delete' || action === 'post') {
    if (!input.delete_password || input.delete_password.trim() === '') {
      return res.status(400).send('The password property is mandatory and it can\'t be an empty string.');
    }
  }

  return thread;
};

module.exports = { validateInput };

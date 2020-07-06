require('dotenv').config()
const { Telegraf } = require('telegraf')
const Telegram = require('telegraf/telegram')
// const format = require('date-format')
const logger = require('./logger')
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
// =========================
// SETUP 

logger.info('// STARTING APP')
logger.info('// ========================')
logger.info('App just started. Calling the Telegram BOT')

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY)

app.all('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(9999, () => {
  logger.info('App listening to port 9999')

});
bot.launch();

// ========================

bot.start((ctx) => {
  console.log('From id:', ctx.from.id)
  console.log('Chat id:', ctx.chat.id)
  ctx.reply('Welcome')
})
bot.hears('hi', (ctx) => ctx.reply('Hey there'))


// ========================

const text_truncate = (str, length, ending) => {
    if (length == null) {
      length = 200;
    }
    if (ending == null) {
      ending = '...';
    }
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }
  };

const parseCommentJira = (msg, commentBody) => {
  if(!commentBody.comment.jsdPublic){
    msg += ` <u>(Interno)</u>\n`
  } else {
    msg += `\n\n`
  }
  msg += `<b>- Codigo</b>: ${commentBody.issue.key}\n`
  msg += `<b>- Tipo</b>: ${commentBody.issue.fields.issuetype.name}\n`
  msg += `<b>- Issue</b>: ${commentBody.issue.fields.summary}\n`
  msg += `<b>- Estado</b>: ${commentBody.issue.fields.status.name}\n`
  msg += `<b>- Comentario</b>: "${text_truncate(commentBody.comment.body)}"`
  return msg
}
const parseIssueJira = (msg, issueBody) => {
  msg += `\n\n`
  msg += `<b>- Codigo</b>: ${issueBody.issue.key}\n`
  msg += `<b>- Tipo</b>: ${issueBody.issue.fields.issuetype.name}\n`
  msg += `<b>- Issue</b>: ${issueBody.issue.fields.summary}\n`
  msg += `<b>- Estado</b>: ${issueBody.issue.fields.status.name}\n`
  msg += `<b>- Descripcion</b>: "${text_truncate(issueBody.issue.fields.description)}"`
  return msg
}

const sendTo = () => {
  if(process.env.APP_ENV == 'prod') return process.env.TELEGRAM_GROUP_ID
  return process.env.TELEGRAM_CHAT_TEST_ID
}

const parseBodyJira = (body) => {
  switch(body.webhookEvent){
    case 'comment_updated':
      return parseCommentJira('<b>📩 Comentario actualizado</b>', body)
    case 'comment_created':
      return parseCommentJira('<b>📩 Comentario creado</b>', body)
    case 'jira:issue_created':
      return parseIssueJira('<b>🆕 Issue creado</b>', body)
  }
  return '- Fail'
}

app.post('/webhook', function (req, res) {
  const message = parseBodyJira(req.body);
  console.log(req.body.issue.fields.issuetype)
  console.log(req.body.issue.fields.status)
  console.log(req.body.issue.fields.project)
  console.log("POST from Lyris IT Jira Service Desk")
  console.log(message);
  bot.telegram.sendMessage(sendTo(), message, {parse_mode: 'HTML'});
  res.status(204)
});

// =========================
// FUNCTIONS

function shutDown() {
  logger.info('Received kill signal, shutting down gracefully');
  process.exit(0);

}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

// bot.on('reconnecting', (reconnecting) => {
//   f.log(util.inspect(reconnecting, true, 99));
//   f.log("Lost connection"); LastConnectionLost = new Date();
// });

// bot.on('reconnected', (reconnected) => { 
//   f.log(util.inspect(reconnected, true, 99));
//   f.log("connection successfully");
//   bot.sendMessage(config.LogChat, "Bot is back online. Lost connection at " + f.getDateTime(LastConnectionLost))
// });

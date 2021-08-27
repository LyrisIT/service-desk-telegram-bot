require('dotenv').config()
const { Telegraf } = require('telegraf')
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
  if(ctx.chat.id == sendTo()) ctx.reply('👋 ¡Hola! ')
})
bot.command('check', (ctx) => {
  if(ctx.chat.id == sendTo()) ctx.reply('Estoy vivo 😀')
})
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))


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
    msg += ` <u>(Interno)</u>\n\n`
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
const parseSimpleIssueJira = (msg, issueBody) => {
  msg += `\n\n`
  msg += `<b>- Codigo</b>: ${issueBody.issue.key}\n`
  msg += `<b>- Tipo</b>: ${issueBody.issue.fields.issuetype.name}\n`
  msg += `<b>- Issue</b>: ${issueBody.issue.fields.summary}\n`
  msg += `<b>- Estado</b>: ${issueBody.issue.fields.status.name}\n`
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
    case 'jira:issue_updated':
      return parseSimpleIssueJira('<b>📝 Issue actualizado</b>', body)
    case 'jira:issue_deleted':
      return parseSimpleIssueJira('<b>🗑️ Issue eliminado</b>', body)
    default:
      logger.log(body)
      break
  }
  return 'Webhook no determinado... ¿Error? (Check log)'
}

app.post('/webhook', function (req, res) {
  const message = parseBodyJira(req.body);
  logger.info("POST from Lyris IT Jira Service Desk")
  logger.info(message);
  bot.telegram.sendMessage(sendTo(), message, {parse_mode: 'HTML'});
  res.status(200).json({code: '200'})
});

app.get('*', function(req, res){
  res.status(404).json({message: 'Not found'});
});

// =========================
// FUNCTIONS

function shutDown() {
  logger.info('Received kill signal, shutting down gracefully');
  process.exit(0);

}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);


# Lyris IT BOT
> A Telegram BOT for Lyris IT

This is a simple bot made with [Telegraf](https://telegraf.js.org/). Exclusively made for a telegram group for the developers to recieve updates from Jira Service Desk

### Problem
We needed a bot that listen to Jira Service Help Desk webhooks and notifies us.

### Solution
Create a bot in Telegram that recieves a webhook and send us to a chat group.

### Setup


Create a .env file with the following env vars
```
APP_ENV=
TELEGRAM_BOT_API_KEY=
TELEGRAM_GROUP_ID=
TELEGRAM_CHAT_TEST_ID=
```

* `APP_ENV` use `prod` or `dev`.
* `TELEGRAM_BOT_API_KEY` is the key that `@BotFather` gives you to use the bot. If you dont have one I reccomend you to interact with [@GodFather](https://t.me/GodFather).
* The bot interacts with a database. In this case, a mysql databese. So please complete the `DB_HOST`
* `TELEGRAM_GROUP_ID` is the group that the bot listens and interacts. The bot is not intended to have or answer in a 1-on-1 conversations. It is intended to work in a Telegram Group.
* `TELEGRAM_CHAT_TEST_ID` is the only exception to the previous rule. 

---

Made by **Guillermo Croppi**

Github: [@guillecro](https://github.com/guillecro)

Telegram username: [ZachariasVonZaqueo](https://t.me/ZachariasVonZaqueo)
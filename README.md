# [Nutrient Bot](http://nutbot) - Bot for Food Nutrient Information

[![npm](https://img.shields.io/npm/v/botkit.svg)](https://www.npmjs.com/package/botkit)
[![David](https://img.shields.io/david/howdyai/botkit.svg)](https://david-dm.org/howdyai/botkit)
[![npm](https://img.shields.io/npm/l/botkit.svg)](https://spdx.org/licenses/MIT)

Nutrient Bot is designed to let to people to know about nutrient with creative bots that live inside [Slack](http://slack.com), [Facebook Messenger](http://facebook.com), [Twilio IP Messaging](https://www.twilio.com/docs/api/ip-messaging), and other messaging platforms.

It provides a semantic interface to sending and receiving messages so that developers can focus on creating novel applications and experiences instead of dealing with API endpoints.

Botkit features a comprehensive set of tools to deal with popular messaging platforms, including:

* [Slack](readme-slack.md)
* [Facebook Messenger](readme-facebook.md)
* [Twilio IP Messaging](readme-twilioipm.md)
* Yours? [info@howdy.ai](mailto:info@howdy.ai)

## Installation
...

## Getting Started

After you've installed NutBot, the first thing you'll need to do is register your bot with a messaging platform, and get a few configuration options set. This will allow your bot to connect, send and receive messages.

The fastest way to get a bot online and get to work is to start from one of the [examples included in the repo](#included-examples).

If you intend to create a bot that
lives in Slack, [follow these instructions for attaining a Bot Token](readme-slack.md#getting-started).

If you intend to create a bot that lives in Facebook Messenger, [follow these instructions for configuring your Facebook page](readme-facebook.md#getting-started).

If you intent to create a bot that lives inside a Twilio IP Messaging client, [follow these instructions for configuring your app](readme-twilioipm.md#getting-started).

## Core Concepts

Bots built with Botkit have a few key capabilities, which can be used to create clever, conversational applications. These capabilities map to the way real human people talk to each other.

Bots can [hear things](#receiving-messages). Bots can [say things and reply](#sending-messages) to what they hear.

With these two building blocks, almost any type of conversation can be created.

To organize the things a bot says and does into useful units, Botkit bots have a subsystem available for managing [multi-message conversations](#multi-message-replies-to-incoming-messages). Conversations add features like the ability to ask a question, queue several messages at once, and track when an interaction has ended.  Handy!

After a bot has been told what to listen for and how to respond,
it is ready to be connected to a stream of incoming messages. Currently, Botkit supports receiving messages from a variety of sources:

* [Slack Real Time Messaging (RTM)](http://api.slack.com/rtm)
* [Slack Incoming Webhooks](http://api.slack.com/incoming-webhooks)
* [Slack Slash Commands](http://api.slack.com/slash-commands)
* [Facebook Messenger Webhooks](https://developers.facebook.com/docs/messenger-platform/implementation)
* [Twilio IP Messaging](https://www.twilio.com/user/account/ip-messaging/getting-started)

Read more about [connecting your bot to Slack](readme-slack.md#connecting-your-bot-to-slack), [connecting your bot to Facebook](readme-facebook.md#getting-started), or [connecting your bot to Twilio](readme-twilioipm.md#getting-started).

## Included Examples

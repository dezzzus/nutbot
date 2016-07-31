/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it is running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


/*if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

if (!process.env.wit) {
  console.log('Error: Specify wit in environment');
  process.exit(1);
}*/

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://robin:addens@candidate.56.mongolayer.com:10654/app54021376';
//var url = 'mongodb://localhost:27017/mydatabase';

var Proximates = ["Water", "Energy", "Protein", "Total lipid (fat)", "Carbohydrate, by difference",
  "Fiber, total dietary", "Sugars", "total"];
var Minerals = ["Calcium, Ca", "Iron, Fe", "Magnesium, Mg", "Phosphorus, P", "Potassium, K",
  "Sodium, Na", "Zinc, Zn"];
var Vitamins = ["Vitamin C, total ascorbic acid", "Thiamin", "Riboflavin", "Niacin", "Vitamin B-6", "Folate, DFE",
  "Vitamin B-12", "Vitamin A, RAE", "Vitamin A, IU", "Vitamin E (alpha-tocopherol)", "Vitamin D (D2 + D3)",
  "Vitamin D", "Vitamin K (phylloquinone)"];
var Lipids =["Fatty acids, total saturated", "Fatty acids, total monounsaturated",
  "Fatty acids, total polyunsaturated", "Fatty acids, total trans", "Cholesterol"];

var Botkit = require('./lib/Botkit.js');
/*
var wit = require('./lib/middleware/botkit-middleware-witai')({
  token: process.env.wit,
});*/
var os = require('os');
var async = require('async');
var controller = Botkit.slackbot({
  debug: true
});
/*let Wit = null;
try {
  // if running from repo
  Wit = require('../').Wit;
} catch (e) {
  Wit = require('node-wit').Wit;
}

const witclient = new Wit({accessToken: process.env.wit});
console.log (process.env.wit);
*/

var bot = controller.spawn({
    token: "xoxb-62439643361-0IZ5PwaYRhzsXZX8FVg5Taly"
}).startRTM();
var nut_data = "";

/*MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
    callbackDone();
  } else {
    console.log("%o", db);
  }
});*/
/*
controller.middleware.receive.use(function(bot, message, next) {

  // do something...
  // message.extrainfo = 'foo';
  witclient.message(message.text, {})
    .then((data) => {
    console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
    message.intent=data.entities.intent;
  })

  .catch(
    console.error
  );
  next();

});

function wit_hear_middle(patterns, message)
{
  witclient.message(message.text, {})
    .then((data) => {
    message.intent = data.entities.intent;
  return true;
})
.catch(console.error);
  return false;
}*/
/*
controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});
*/
controller.hears(['hi','hello'], 'direct_message,direct_mention,mention', function(bot,message) {
  //console.log("bot : %o", bot);
  //console.log("message : %o", message);
  bot.startPrivateConversation(message, ask1);
});

getNutrientsData = function(food_item, food_kind, amount, callbackDone)
{
  //var nut_name = food_item + status;
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      callbackDone ();
    } else {
      var collection = db.collection('nutrient');

      collection.findOne({"name.long": {$regex:"^"+food_kind + ".*", $options:'i'}}, function(err, col) {
        if (err || !col) {
          convo.say("hmm, I can't find the information of "+food_kind);
          callbackDone ();
          return;
        }
        //var replymsg = 'This is 100 gram of ' + nut_name + '\'s Nutrient Information\n';
        var replymsg = "This is nutrient information\n";
        replymsg = replymsg + " - Proximate *******************\n\n";
        col.nutrients.forEach(function (item, index) {
          if (Proximates.indexOf(item.name) != -1)
            replymsg = replymsg + '\t' + item.name + "\t\t:\t" + (item.value * amount / 100).toFixed(2) +" "+ item.units+'\n';
        });
        replymsg = replymsg + "\n - Minerals *******************\n\n";
        col.nutrients.forEach(function (item, index) {
          if (Minerals.indexOf(item.name) != -1)
            replymsg = replymsg + '\t' + item.name + "\t\t:\t" + (item.value * amount / 100).toFixed(2) +" "+ item.units+'\n';
        });
        replymsg = replymsg + "\n - Vitamins *******************\n\n";
        col.nutrients.forEach(function (item, index) {
          if (Vitamins.indexOf(item.name) != -1)
            replymsg = replymsg + '\t' + item.name + "\t\t:\t" + (item.value * amount / 100).toFixed(2) +" "+ item.units+'\n';
        });
        replymsg = replymsg + "\n - Lipids *******************\n\n";
        col.nutrients.forEach(function (item, index) {
          if (Lipids.indexOf(item.name) != -1)
            replymsg = replymsg + '\t' + item.name + "\t\t:\t" + (item.value * amount / 100).toFixed(2) +" "+ item.units+'\n';
        });
        //bot.reply(message, replymsg);
        nut_data = replymsg;
        callbackDone ();
        //return replymsg;
      });
      //Close connection
      db.close();
    }
  });
}

ask1 = function(response, convo) {
  convo.ask("A big Moo Welcome; \nHow are you?", function(response, convo) {
    convo.ask("just type a food and I will do some digging...", function(response, convo) {
      ask2 (response, convo);
      convo.next();
    });
    convo.next();
  });
}

ask_foodkind = function (response, convo, db, collection, food_item, food_kind, kind_var, callbackDone) {
  convo.ask("What kind of " + food_item + " did you eat?\n" + kind_var + " )",
    function(response, convo) {
      convo.next();
      //var food_kind = response.text;
      var q_foodkind = food_kind.split(",");
      var query = "{\"$and\" : [" + '{\"name.long\" : {\"$regex\":\".*'+ food_item + ".*\", \"$options\":\"i\"}}";
      q_foodkind.forEach(function(item, index){
        //if (index > 0)
          query = query + ',{\"name.long\" : {\"$regex\":\".*'+ item + ".*\", \"$options\":\"i\"}}"
        //else
        //  query = query + '{\"name.long\" : {\"$regex\":\".*'+ item + ".*\", \"$options\":\"i\"}}"
      })
      query = query +"]}";
      //collection.findOne({"name.long":food_kind}, function(err,doc){
      //query = "{\"$and\" : [,{\"name.long\" : {\"$regex\":\".*filled.*\", \"$options\":\"i\"}},{\"name.long\" : {\"$regex\":\".* fluid.*\", \"$options\":\"i\"}}]}";
      console.log(query);
      collection.findOne(JSON.parse(query), function(err,doc){
        if (err)
        {
          convo.say("hmm, I can't find the information of "+food_kind);
          convo.next();
          db.close();
          return;
        }
        var portions = " ";

        doc.portions.map(function(item){
          portions = portions + item.unit + ", ";
        })
        console.log (portions);

        convo.ask("How much did you eat " + food_item + "?\n\t(unit of " +
          portions+")\n", function (response, convo) {
          var amount = response.text;
          var val = response.text.split(" ");
          if (isNaN(val[0]))
          {
            convo.say("hmm, I think you inputed incorrect value");
            convo.next();
            callbackDone();
            return;
          }

          doc.portions.map(function(item){
            if (val[1] == item.unit)
              amount = Number(val[0]) * item.g;
          })

          getNutrientsData(food_item, food_kind, amount, callbackDone);
          convo.next();
          db.close();
        });
      })
    });
  convo.next();
}
ask2 = function(response, convo) {
  //console.log ("response : %o", response);
  //console.log ("convo : %o", convo);
  var foods = response.text.split(",");
  var nutrients = [];

  var iteration = function(food_item,callbackDone) {
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        callbackDone ();
      } else {
        var collection = db.collection('nutrient');

        collection.find({"name.long": {"$regex":"^"+food_item + ".*", "$options":'i'}})
          .toArray(function(err, cols) {
            if (err || cols.length == 0) {
              convo.say("hmm, I can't find the information of "+food_item);
              convo.next();
              db.close();
              return;
            }

            var kind_var = "( ";
            var keyword= [];
            cols.forEach(function(item){
              key = item.name.long.split(", ");
              key.map(function (item){
                if (keyword.indexOf(item) < 0)
                  keyword.push(item);
              })
            })

            keyword.map(function(item) {
              kind_var = kind_var + item + ", ";
            })
            ask_foodkind (response, convo, db, collection, food_item, response.text, kind_var, callbackDone)
            convo.next();
            //return replymsg;
          });
      }
    });

  };

  async.eachSeries(foods, iteration, function (err) {
    convo.say(nut_data);
    convo.next();
  });
}

ask3 = function(response, convo, food_item, resolve) {
  convo.ask("What kind of " + food_item + " did you eat?\n"
    + "\t(fried, omelet, poached, scrambled, hard-boiled, white, raw, cooked, dried, duck, goose, quail, turkey)",
    function(response, convo) {
      //convo.ask("So where do you want it delivered?", function(response, convo) {
      convo.say("well, I think");
      convo.next();
      resolve();
    });
}

controller.hears(['tell me about (.*)'], 'direct_message,direct_mention,mention',/*wit_hear_middle,*/ function(bot, message) {

  /*mycol.findOne ({}).exec()
    .then(function(col){
    console.log (col);
    return col;
  })*/
  var nut_name = message.match[1];
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);
      var collection = db.collection('nutrient');

      collection.findOne({"name.long":nut_name}, function(err, col) {
        //console.log(col);
       /* bot.api.reactions.add({
          timestamp: message.ts,
          channel: message.channel,
          name: 'robot_face',
        }, function(err, res) {
          if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
          }
        });*/


        controller.storage.users.get(message.user, function(err, user) {
          if (user && user.name) {
            bot.reply(message, 'Hey. Here is Nutrient Center ' + user.name + '!!');
          } else {
            var replymsg = 'This is 100 gram of ' + nut_name + '\'s Nutrient Information\n';
            replymsg = replymsg + " - Proximate *******************\n\n";
            col.nutrients.forEach(function (item, index) {
              if (Proximates.indexOf(item.name) != -1)
                replymsg = replymsg + '\t' + item.name + "\t\t:\t" + item.value +" "+ item.units+'\n';
            });
            replymsg = replymsg + "\n - Minerals *******************\n\n";
            col.nutrients.forEach(function (item, index) {
              if (Minerals.indexOf(item.name) != -1)
                replymsg = replymsg + '\t' + item.name + "\t\t:\t" + item.value +" "+ item.units+'\n';
            });
            replymsg = replymsg + "\n - Vitamins *******************\n\n";
            col.nutrients.forEach(function (item, index) {
              if (Vitamins.indexOf(item.name) != -1)
                replymsg = replymsg + '\t' + item.name + "\t\t:\t" + item.value +" "+ item.units+'\n';
            });
            replymsg = replymsg + "\n - Lipids *******************\n\n";
            col.nutrients.forEach(function (item, index) {
              if (Lipids.indexOf(item.name) != -1)
                replymsg = replymsg + '\t' + item.name + "\t\t:\t" + item.value +" "+ item.units+'\n';
            });
            bot.reply(message, replymsg);
          }
        });
        // here ...
      });

      // do some work here with the database.

      //Close connection
      db.close();
    }
  });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 8080));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
  var result = 'App is running'
  response.send(result);
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});
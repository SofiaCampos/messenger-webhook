'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 5000, function(){ 
  console.log('webhook is listening '+app.get('port')) 
});

// Server index page
app.get("/", function (req, res) {
  res.send("Aqui estamos Sofi!!");
  /*
  if (event.game_play) {
    console.log("get out of instant game");
    var senderId = event.sender.id; // Messenger sender id
    var playerId = event.game_play.player_id; // Instant Games player id
    var contextId = event.game_play.context_id; 
    var payload = event.game_play.payload;
    var playerWon = payload['playerWon'];
    sendMessage(
        senderId, 
        contextId, 
        'Hey! Seguro que no quieres ver más ;)!', 
        'Play Again'
      );
    if (playerWon) {
      console.log("ganó");
      sendMessage(
        senderId, 
        contextId, 
        'Congratulations on your victory!', 
        'Play Again'
      );

    } else {
      sendMessage(
        senderId, 
        contextId, 
        'Better luck next time!', 
        'Rematch!'
      );
    }
  }
  */
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
  let ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      res.send(challenge);
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
    res.send("No entry! Pruebita :)");
  }
});

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;
  console.log('received bot webhook');
  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;
      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
          if (event.message) {
              receivedMessage(event);
          } else if (event.game_play) {
              receivedGameplay(event);
          } else {
              console.log("Webhook received unknown event: ", event);
          }
      });
      //let webhook_event = entry.messaging[0];
      //console.log(webhook_event);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

//
// Handle messages sent by player directly to the game bot here
//
function receivedMessage(event) {
  
}

//
// Handle game_play (when player closes game) events here. 
//
function receivedGameplay(event) {
  console.log("Sofi sofi Webhook received gameplay event: ", event);
  // Page-scoped ID of the bot user
  var senderId = event.sender.id; 

  // FBInstant player ID
  var playerId = event.game_play.player_id; 

  // FBInstant context ID 
  var contextId = event.game_play.context_id;

  // Check for payload
  if (event.game_play.payload) {
    //
    // The variable payload here contains data set by
    // FBInstant.setSessionData()
    //
    var payload = JSON.parse(event.game_play.payload);

    // In this example, the bot is just "echoing" the message received
    // immediately. In your game, you'll want to delay the bot messages
    // to remind the user to play 1, 3, 7 days after game play, for example.
    console.log("Vamos a enviar un mensaje por que el jugador acaba de salir del juego");
    sendMessage(senderId, null, "Quieres juagr de nuevo?", "Jugar!", payload);
  }else{
    console.log("No hay payload");
  }
}

//
// Send bot message
//
// player (string) : Page-scoped ID of the message recipient
// context (string): FBInstant context ID. Opens the bot message in a specific context
// message (string): Message text
// cta (string): Button text
// payload (object): Custom data that will be sent to game session
// 
function sendMessage(player, context, message, cta, payload) {
    var button = {
        type: "game_play",
        title: cta
    };

    if (context) {
        button.context = context;
    }
    if (payload) {
        button.payload = JSON.stringify(payload)
    }
    var messageData = {
        recipient: {
            id: player
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [
                    {
                        title: message,
                        buttons: [button]
                    }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

}

function callSendAPI(messageData) {
  console.log("A enviar mensaje para que vuelva  a jugar!");
    var graphApiUrl = 'https://graph.facebook.com/me/messages?access_token='+ACCESS_TOKEN;
    request({
        url: graphApiUrl,
        method: "POST",
        json: true,  
        body: messageData
    }, function (error, response, body){
      if (!err) {
        console.log('Mensaje enviado!')
      } else {
        console.error("No se puedo enviar el mensaje:" + err);
      }
      console.error('Sofi send api returned', 'error', error, 'status code', response.statusCode, 'body', body);
    });
}
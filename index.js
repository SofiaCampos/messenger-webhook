'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 5000, function() { console.log('webhook is listening '+app.get('port')) } );

// Server index page
app.get("/", function (req, res) {
  res.send("Aqui estamos!!");

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

});

// Creates the endpoint for our webhook 
app.post('/webhook/', (req, res) => {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook/', (req, res) => {

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
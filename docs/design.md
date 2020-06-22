# Overview

A Fake Artist Goes to New York game architecture. It needs to support up to 10 players

# Network Architecture
- API Gateway Websocket
- Lambda
- DynamoDB for session storage
- S3 for static website content

# Client Software Architecture
PhaserJS
Websockets (for RTC signalling, and some game state handling)
WebRTC

Make the aspect ratio the same as on phones. Computers can deal with zooming / updates easier. The same ratio for everything makes drawing updates easier.

Game States:
  DRAWING => person drawing is in this state, at end of state, randomly choose a drawer to draw, tell everyone, move to waiting
  WAITING => watch someone draw
  VOTING => vote for who the fake artist is. If you are the fake-artist, you instead guess the specific topic
  DONE => server tells you of results (you picked _x_ as the fake artist! _y_ was the fake artist, _y_ guessed incorrectly|correctly, artists/fake-artist wins!)

# Questions

- How do we implement zooming?
  - We use PhaserJS which has camera support., i.e. what user sees is not the whole game, supports zooming
  - How do we send this data?
    - Use event listeners to send normalised co-ordinates (e.g. after accounting for screen width and window width). If this is sent 60/fps, it _could_ be a lot of bandwidth. But we will have to spike it out and see.

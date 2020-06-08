# Overview

A Fake Artist Goes to New York game architecture. It needs to support up to 10 players

# Slices

## Networking
1. Set up signalling / ICE / STUN Server
1. Set up /connect and /join endpoints
1. Set up WebRTC peering connections for same room ids
    - On connect, figure out who is to be offerer and who is answerer

## Spike Out Feasibility
1. Instantiate simple phaser engine, draw on a screen, this sends updates to all connected peers.
    - Study bandwidth concerns
    - Study accuracy / latency issues

## Simple Game
1. DRAWER flag to allow only one to draw at a time
1. flag is sent to next peer in round-robin queue
    - How do we create this queue? Can we guarantee the list from the server is ordered?
      - We could send the queue along with the flag, host decides who plays in which order
1. Do as above, but with a timeout
1. Do as above, limit number of loops (_n_ rotations of the players) to the game amount

## Actual Game
1. Simple picking of subject (after game starts?)
1. Picking of Fake Artist
    - Artist gets clue instead of subject
1. Fake Artist is revealed at the end of the loops
1. Artist guesses correctly

## Polished Game
1. Add the polish

# Network Architecture
2 APIGateway websocket endpoints:
- fake-artist/ -> fake-artist/host
- fake-artist/ -> fake-artist/join

S3 for static website content

# Software Architecture
PhaserJS
Websockets (for RTC signalling)
WebRTC

Make the aspect ratio the same as on phones. Computers can deal with zooming / updates easier. The same ratio for everything makes drawing updates easier.

# Questions

- How do we implement zooming?
  - We use PhaserJS which has camera support.
- How do we want to send whiteboard updates? We could fiddle with WebRTC but there are issues there (having to switch the HOST to the new player, every time a player gets a turn)
  - Approach is to use websocket to send updates that are broadcasted out
  - How do we send this data?
    - Use event listeners to send normalised co-ordinates (e.g. after accounting for screen width and window width). If this is sent 60/fps, it _could_ be a lot of bandwidth. But we will have to spike it out and see.

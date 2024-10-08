> [!NOTE]  
> The missiles in this game are not replicated on the server.
> I stopped working on this project because all I really wanted to do
> was create a nice little missile feature.

# Cursor Game

A simple game where you control a cursor to move around and battle another player.

# How to run

1. Clone the repo

```bash
git clone https://github.com/maytees/cursor-game
```

2. Install packages

```bash
pnpm i

OR

npm i
```

3. Start vite server

```bash
pnpm run dev

OR

npm run dev
```

4. Start SocketIO server

```bash
cd server/

pnpm start

OR

npm start
```

# How to play

## Create a party

To create a party, click on the create button. A 6 digit code will be generated
and placed at the top of your screen. Once two players have joined the game and are
both in a ready state, the party creator is able to start the game.

## Join a party

To join a party, click the join button then enter in the code given by your party leader.
Someone joining a party will not be able to start the game, as only the party leader is able to.

## Controls

`Left Click` - Fires a bullet

`x` - Fires a missile towards a target (doesn't do damage and is not replicated on the server as of now)

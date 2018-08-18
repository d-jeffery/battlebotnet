// @flow
'use strict';

/**
 * User sessions
 * @param {Array} users
 */
const users = [];

/**
 * Find opponent for a user
 * @param {User} user
 */
function findOpponent(user) {
    for (let i = 0; i < users.length; i++) {
        if (user !== users[i] && users[i].opponent === null) {
            new Game(user, users[i]).start();
        }
    }
}

/**
 * Remove user session
 * @param {User} user
 */
function removeUser(user) {
    users.splice(users.indexOf(user), 1);
}

/**
 * Game class
 */
class Game {
    /**
     * @param {User} user1
     * @param {User} user2
     */
    constructor(user1, user2) {
        this.user1 = user1;
        this.user2 = user2;
        this.turnNum = 0;
    }

    /**
     * Start new game
     */
    start() {
        this.turnNum = 0;
        this.user1.start(this, this.user2);
        this.user2.start(this, this.user1);
    }

    /**
     * Do a game turn
     */
    turn() {
        // Update turn
        this.turnNum++;
        // Updated state
        this.user1.state.turnUpdate(this.user2.state);
        this.user2.state.turnUpdate(this.user1.state);
        // Do turn
        this.user1.turn();
        this.user2.turn();
    }

    /**
     * Whether the game turn has ended.
     */
    turnEnded() {
        return this.user1.endedTurn && this.user2.endedTurn;
    }

    /**
     * Final score.
     */
    score() {
        const a1 = this.user1.state.points.availablity <= 0;
        const a2 = this.user2.state.points.availablity <= 0;

        const m1 = this.user1.state.points.money < 0;
        const m2 = this.user2.state.points.money < 0;

        if ((a1 && a2) || (m1 && m2) || (m1 && a2) || (a1 && m2)) {
            this.user1.draw();
            this.user2.draw();
            return true;
        } else if (a1 || m1) {
            this.user2.win();
            this.user1.lose();
            return true;
        } else if (a2 || m2) {
            this.user1.win();
            this.user2.lose();
            return true;
        }

        return false;
    }
}

/**
 * User session class
 */
class User {
    /**
     * @param {Socket} socket
     */
    constructor(socket) {
        this.socket = socket;
        this.game = null;
        this.opponent = null;
        this.endedTurn = false;
        this.state = new State();
    }

    /**
     * Start new game
     * @param {Game} game
     * @param {User} opponent
     */
    start(game, opponent) {
        this.game = game;
        this.opponent = opponent;
        this.endedTurn = false;
        this.state = new State();
        this.socket.emit('start', this.state, this.opponent.state, this.game.turnNum);
    }

    /**
     * Terminate game
     */
    end() {
        this.game = null;
        this.opponent = null;
        this.endedTurn = false;
        this.state = new State();
        this.socket.emit('end');
    }

    /**
     * Trigger on state change, like purchase.
     */
    stateChange() {
        this.state.stateUpdate();
        this.socket.emit('state', this.state);
    }

    /**
     * Trigger turn event
     */
    turn() {
        this.state.stateUpdate();
        this.endedTurn = false;
        this.socket.emit('turn', this.state, this.opponent.state, this.game.turnNum);
    }

    /**
     * Trigger win event
     */
    win() {
        this.socket.emit('win', this.opponent.guess);
    }

    /**
     * Trigger lose event
     */
    lose() {
        this.socket.emit('lose', this.opponent.guess);
    }

    /**
     * Trigger draw event
     */
    draw() {
        this.socket.emit('draw', this.opponent.guess);
    }
}

/**
 * State of player.
 */
class State {
    constructor() {
        this.points = new Points();
        this.purchases = new Purchases();
    }

    /**
     * Do update at end of turn.
     * @param {State} enemyState
     */
    turnUpdate(enemyState) {
        this.points.money += 3 + this.purchases.mineLevel;
        if (this.purchases.proxy === PROXY_BASIC) this.points.money -= 2;
        if (this.purchases.proxy === PROXY_ENTERPRISE) this.points.money -= 4;
        this.purchases.hackers = this.purchases.hackers.map(x => x - 1).filter(x => x > 0);

        // Make sure state is up to date
        this.stateUpdate();
        enemyState.stateUpdate();
        // Calculate the availability
        this.points.availablity = Math.min(this.points.security - enemyState.points.power, 0) + 3;
    }

    /**
     * Update state based on purchases.
     */
    stateUpdate() {
        this.points.power = this.purchases.botnetLevel + this.purchases.hackers.length * 3;
        this.points.security = this.purchases.serverLevel + this.purchases.proxy * 4;
    }
}

/**
 * Player Points.
 */
class Points {
    constructor() {
        // Resources
        this.money = 3;
        this.power = 0;
        this.security = 0;
        this.availablity = 3;
    }

    /**
     * Sets the availability.
     * @param {number} a
     */
    setAvailablity(a) {
        this.availablity = a;
    }
}

/**
 * Player inventory.
 */
class Purchases {
    constructor() {
        // Purchases
        this.botnetLevel = 0;
        this.hackers = [];
        this.serverLevel = 0;
        this.proxy = PROXY_NONE;
        this.mineLevel = 0;
    }
}

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
module.exports = {
    io: socket => {
        const user = new User(socket);
        users.push(user);
        findOpponent(user);

        socket.on('disconnect', () => {
            console.log('Disconnected: ' + socket.id);
            removeUser(user);
            if (user.opponent) {
                user.opponent.end();
                findOpponent(user.opponent);
            }
        });

        socket.on('purchase', option => {
            console.log('purchase: ' + socket.id);
            store.purchase(option, user.state);
            user.stateChange();
        });

        socket.on('endTurn', () => {
            console.log('End Turn: ' + socket.id);
            user.endedTurn = true;
            if (user.game.turnEnded()) {
                user.game.turn();
                user.game.score();
            }
        });

        console.log('Connected: ' + socket.id);
    },

    stat: (req, res) => {
        storage.get('games', 0).then(games => {
            res.send(`<h1>Games played: ${games}</h1>`);
        });
    }
};

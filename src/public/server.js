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
        this.user1.state.turnUpdate();
        this.user2.state.turnUpdate();
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
     * Is game ended
     * @return {boolean}
     */
    ended() {
        return this.user1.guess !== GUESS_NO && this.user2.guess !== GUESS_NO;
    }

    /**
     * Final score
     */
    score() {
        if (
            (this.user1.guess === GUESS_ROCK && this.user2.guess === GUESS_SCISSORS) ||
            (this.user1.guess === GUESS_PAPER && this.user2.guess === GUESS_ROCK) ||
            (this.user1.guess === GUESS_SCISSORS && this.user2.guess === GUESS_PAPER)
        ) {
            this.user1.win();
            this.user2.lose();
        } else if (
            (this.user2.guess === GUESS_ROCK && this.user1.guess === GUESS_SCISSORS) ||
            (this.user2.guess === GUESS_PAPER && this.user1.guess === GUESS_ROCK) ||
            (this.user2.guess === GUESS_SCISSORS && this.user1.guess === GUESS_PAPER)
        ) {
            this.user2.win();
            this.user1.lose();
        } else {
            this.user1.draw();
            this.user2.draw();
        }
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
        this.guess = GUESS_NO;
        this.endedTurn = false;
        this.state = new State();
    }

    /**
     * Set guess value
     * @param {number} guess
     */
    setGuess(guess) {
        if (!this.opponent || guess <= GUESS_NO || guess > GUESS_SCISSORS) {
            return false;
        }
        this.guess = guess;
        return true;
    }

    /**
     * Start new game
     * @param {Game} game
     * @param {User} opponent
     */
    start(game, opponent) {
        this.game = game;
        this.opponent = opponent;
        this.guess = GUESS_NO;
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
        this.guess = GUESS_NO;
        this.endedTurn = false;
        this.state = new State();
        this.socket.emit('end');
    }

    /**
     * Trigger turn event
     */
    turn() {
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

    turnUpdate() {
        this.points.money += 3 + this.purchases.mineLevel;
        if (this.purchases.proxy === PROXY_BASIC) this.points.money -= 2;
        if (this.purchases.proxy === PROXY_ENTERPRISE) this.points.money -= 4;
        this.purchases.hackers = this.purchases.hackers.map(x => x - 1).filter(x => x > 0);
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
        this.fireWall = false;
        this.serverLevel = 0;
        this.proxy = PROXY_NONE;
        this.mineLevel = 0;
    }

    // Update hackers
}

/**
 * Store to purchase upgrades.
 */
const store = {
    /**
     * Make a purchase
     * @param {number} option
     * @param {State} state
     */
    purchase(option, state) {
        if (this.canBuy(option, state)) {
            state.points.money -= this.getPrice(option, state.purchases);
            switch (option) {
                case BUY_BOTNET:
                    state.purchases.botnetLevel++;
                    break;
                case BUY_HACKER:
                    state.purchases.hackers.push(3);
                    break;
                case BUY_FIREWALL:
                    state.purchases.fireWall = true;
                    break;
                case BUY_SERVER:
                    state.purchases.serverLevel++;
                    break;
                case BUY_PROXY:
                    state.purchases.proxy++;
                    break;
                case BUY_MINE:
                    state.purchases.mineLevel++;
                    break;
                default:
                    break;
            }
        }
    },

    /**
     * Get price of item.
     * @param option
     * @param {State} state
     * @returns {boolean}
     */
    canBuy(option, state) {
        const canAfford = this.getPrice(option, state.purchases) <= state.points.money;

        switch (option) {
            case BUY_FIREWALL:
                return !state.purchases.fireWall && canAfford;
            case BUY_PROXY:
                if (state.purchases.proxy === PROXY_ENTERPRISE) return false;
                return canAfford;
            default:
                return canAfford;
        }
    },

    /**
     * Get price of item.
     * @param option
     * @param {Purchases} purchases
     * @returns {number}
     */
    getPrice(option, purchases) {
        switch (option) {
            case BUY_BOTNET:
                if (purchases.botnetLevel === 0) {
                    return 3;
                } else {
                    return 2;
                }
            case BUY_HACKER:
                return 5;
            case BUY_FIREWALL:
                return 1;
            case BUY_SERVER:
                return 2 + purchases.serverLevel;
            case BUY_PROXY:
                if (purchases.proxy === PROXY_NONE) return 2;
                return 3;
            case BUY_MINE:
                return 3;
            default:
                return Number.MAX_SAFE_INTEGER;
        }
    }
};

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

        socket.on('guess', guess => {
            console.log('Guess: ' + socket.id);
            if (user.setGuess(guess) && user.game.ended()) {
                user.game.score();
                user.game.start();
                storage.get('games', 0).then(games => {
                    storage.set('games', games + 1);
                });
            }
        });

        socket.on('purchase', option => {
            console.log('purchase: ' + socket.id);
            store.purchase(option, user.state);
        });

        socket.on('endTurn', () => {
            console.log('End Turn: ' + socket.id);
            user.endedTurn = true;
            if (user.game.turnEnded()) {
                user.game.turn();
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

'use strict';
let users = [];
function findOpponent(e) {
    for (let t = 0; t < users.length; t++)
        e !== users[t] && users[t].opponent === null && new Game(e, users[t]).start();
}
function removeUser(e) {
    users.splice(users.indexOf(e), 1);
}
class Game {
    constructor(e, t) {
        this.user1 = e;
        this.user2 = t;
        this.turnNum = 0;
    }
    start() {
        this.turnNum = 0;
        this.user1.start(this, this.user2);
        this.user2.start(this, this.user1);
    }
    turn() {
        this.turnNum++;
        this.user1.state.turnUpdate(this.user2.state);
        this.user2.state.turnUpdate(this.user1.state);
        this.user1.turn();
        this.user2.turn();
    }
    turnEnded() {
        return this.user1.endedTurn && this.user2.endedTurn;
    }
    score() {
        let e = this.user1.state.points.availablity <= 0,
            t = this.user2.state.points.availablity <= 0,
            n = this.user1.state.points.money < 0,
            s = this.user2.state.points.money < 0;
        if ((e && t) || (n && s) || (n && t) || (e && s)) {
            this.user1.draw();
            this.user2.draw();
            return !0;
        } else if (e || n) {
            this.user2.win();
            this.user1.lose();
            return !0;
        } else if (t || s) {
            this.user1.win();
            this.user2.lose();
            return !0;
        }
        return !1;
    }
    rematch() {
        return this.user1.rematch && this.user2.rematch;
    }
}
class User {
    constructor(e) {
        this.socket = e;
        this.game = null;
        this.opponent = null;
        this.endedTurn = !1;
        this.rematch = !1;
        this.state = new State();
    }
    start(e, t) {
        this.game = e;
        this.opponent = t;
        this.endedTurn = !1;
        this.rematch = !1;
        this.state = new State();
        this.socket.emit('start', this.state, this.opponent.state, this.game.turnNum);
    }
    end() {
        this.game = null;
        this.opponent = null;
        this.endedTurn = !1;
        this.state = new State();
        this.socket.emit('end');
    }
    stateChange() {
        this.state.stateUpdate();
        this.socket.emit('state', this.state);
    }
    turn() {
        this.state.stateUpdate();
        this.endedTurn = !1;
        this.socket.emit('turn', this.state, this.opponent.state, this.game.turnNum);
    }
    win() {
        this.socket.emit('win', this.opponent.guess);
    }
    lose() {
        this.socket.emit('lose', this.opponent.guess);
    }
    draw() {
        this.socket.emit('draw', this.opponent.guess);
    }
}
class State {
    constructor() {
        this.points = new Points();
        this.purchases = new Purchases();
    }
    turnUpdate(e) {
        this.points.money += 3 + this.purchases.mineLevel;
        this.purchases.proxy === PROXY_BASIC && (this.points.money -= 1);
        this.purchases.proxy === PROXY_ENTERPRISE && (this.points.money -= 2);
        this.purchases.hackers = this.purchases.hackers.map(e => e - 1).filter(e => e > 0);
        this.stateUpdate();
        e.stateUpdate();
        this.points.availablity = Math.min(this.points.security - e.points.power, 0) + 3;
    }
    stateUpdate() {
        this.points.power = this.purchases.botnetLevel + this.purchases.hackers.length * 3;
        this.points.security = this.purchases.serverLevel + this.purchases.proxy * 4;
    }
}
class Points {
    constructor() {
        this.money = 3;
        this.power = 0;
        this.security = 0;
        this.availablity = 3;
    }
    setAvailablity(e) {
        this.availablity = e;
    }
}
class Purchases {
    constructor() {
        this.botnetLevel = 0;
        this.hackers = [];
        this.serverLevel = 0;
        this.proxy = PROXY_NONE;
        this.mineLevel = 0;
    }
}
module.exports = {
    io: e => {
        let t = new User(e);
        e.on('start', () => {
            console.log('Start: ' + e.id), users.push(t), findOpponent(t);
        });
        e.on('restart', () => {
            console.log('Restart: ' + e.id), (t.rematch = !0), t.game.rematch() && t.game.start();
        });
        e.on('disconnect', () => {
            console.log('Disconnected: ' + e.id),
                removeUser(t),
                t.opponent && (t.opponent.end(), findOpponent(t.opponent));
        });
        e.on('purchase', n => {
            console.log('purchase: ' + e.id), store.purchase(n, t.state), t.stateChange();
        });
        e.on('endTurn', () => {
            console.log('End Turn: ' + e.id),
                (t.endedTurn = !0),
                t.game.turnEnded() && (t.game.turn(), t.game.score());
        });
        console.log('Connected: ' + e.id);
    },
    stat: (e, t) => {
        storage.get('games', 0).then(e => {
            t.send(`<h1>Games played: ${e}</h1>`);
        });
    }
};

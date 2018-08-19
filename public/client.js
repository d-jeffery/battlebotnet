'use strict';
!(function() {
    let e,
        t,
        n,
        i,
        r,
        o,
        s,
        a,
        c,
        d,
        u = 0,
        l = { win: 0, lose: 0, draw: 0 };
    function y(e) {
        e.style.display = 'none';
    }
    function g(e) {
        e.style.display = 'inline-block';
    }
    function v() {
        for (let e = 0; e < r.length; e++) r[e].setAttribute('disabled', 'disabled');
    }
    function p() {
        for (let e = 0; e < r.length; e++) r[e].removeAttribute('disabled');
    }
    function m(e, t, n, i) {
        r[e].innerHTML = [
            '<div>' + t + '</div>',
            '<div>' + n + '</div>',
            '<div>' + i + '</div>'
        ].join('');
    }
    function f() {
        let e = c.purchases;
        m(
            BUY_SERVER,
            e.serverLevel === 0 ? 'Buy Firewall' : 'Upgrade Server',
            '+1 Security',
            'Cost: $' + store.getPrice(BUY_SERVER, e)
        );
        let t;
        e.proxy === PROXY_NONE ? (t = 'Buy Basic Proxy') : (t = 'Buy Enterprise Proxy');
        m(BUY_PROXY, t, '+4 Security', 'Cost: $' + store.getPrice(BUY_PROXY, e) + ' per turn');
        m(
            BUY_MINE,
            'Buy Crypto Mine',
            '+1 Money per turn',
            'Cost: $' + store.getPrice(BUY_MINE, e)
        );
        m(
            BUY_BOTNET,
            e.botnetLevel === 0 ? 'Buy BotNet' : 'Upgrade BotNet',
            '+1 Power',
            'Cost: $' + store.getPrice(BUY_BOTNET, e)
        );
        m(
            BUY_HACKER,
            'Hire hacker',
            '+3 Power (2 turns)',
            'Cost: $' + store.getPrice(BUY_HACKER, e)
        );
    }
    function w(e) {
        o.innerHTML = e;
    }
    function h(e) {
        return '<div>' + e + '</div>';
    }
    function B(e) {
        return [
            'Money: ' + e.money,
            'Power: ' + e.power,
            'Security: ' + e.security,
            'Availability: ' + e.availablity
        ].map(h);
    }
    function E() {
        s.innerHTML = [
            '<div class="stat-window">',
            '<h2>Your Stats</h2>',
            ...B(c.points),
            '</div>',
            '<div class="stat-window">',
            '<h2>Enemy Stats</h2>',
            ...B(d.points),
            '</div>'
        ].join('');
    }
    function b(e) {
        a.innerHTML = [
            '<h2>' + e + '</h2>',
            'Won: ' + l.win,
            'Lost: ' + l.lose,
            'Draw: ' + l.draw
        ].join('<br>');
    }
    function L() {
        e.on('start', (e, n, r) => {
            (c = e),
                (d = n),
                (u = r + 1),
                console.log('Game start', e.purchases),
                y(i),
                g(t),
                E(),
                f(),
                p(),
                w('Turn ' + u);
        });
        e.on('state', e => {
            (c = e), console.log('State change', e), E(), f();
        });
        e.on('turn', (e, t, n) => {
            (c = e),
                (d = t),
                (u = n + 1),
                console.log('New turn', e.purchases),
                E(),
                f(),
                p(),
                w('Turn ' + u);
        });
        e.on('win', () => {
            l.win++, g(i), v(), b('You win!');
        });
        e.on('lose', () => {
            l.lose++, g(i), v(), b('You lose!');
        });
        e.on('draw', () => {
            l.draw++, g(i), v(), b('Draw!');
        });
        e.on('end', () => {
            y(t), v(), w('Waiting for opponent...');
        });
        e.on('connect', () => {
            g(n), y(t), v(), w('Press Start to Begin');
        });
        e.on('disconnect', () => {
            y(t), v(), w('Connection lost!');
        });
        e.on('error', () => {
            y(t), v(), w('Connection error!');
        });
        n.addEventListener(
            'click',
            t => {
                w('Waiting for opponent...'), y(n), v(), e.emit('start');
            },
            !1
        );
        i.addEventListener(
            'click',
            t => {
                w('Wait for rematch...'), y(i), v(), e.emit('restart');
            },
            !1
        );
        for (let t = 0; t < r.length; t++)
            ((t, n) => {
                n === END_TURN
                    ? t.addEventListener(
                          'click',
                          t => {
                              v(), e.emit('endTurn');
                          },
                          !1
                      )
                    : t.addEventListener(
                          'click',
                          t => {
                              e.emit('purchase', n);
                          },
                          !1
                      );
            })(r[t], t);
    }
    function P() {
        e = io({ upgrade: !1, transports: ['websocket'] });
        t = document.getElementById('game');
        n = document.getElementById('start');
        i = document.getElementById('restart');
        r = document.getElementById('buttons').getElementsByTagName('button');
        o = document.getElementById('message');
        s = document.getElementById('stats');
        a = document.getElementById('results');
        y(i);
        v();
        L();
    }
    window.addEventListener('load', P, !1);
})();

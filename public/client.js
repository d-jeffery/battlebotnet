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
        u = 0;
    function l(e) {
        e.style.display = 'none';
    }
    function y(e) {
        e.style.display = 'inline-block';
    }
    function g() {
        for (let e = 0; e < o.length; e++) o[e].setAttribute('disabled', 'disabled');
    }
    function v() {
        for (let e = 0; e < o.length; e++) o[e].removeAttribute('disabled');
    }
    function p(e, t, n, i) {
        o[e].innerHTML = [
            '<div>' + t + '</div>',
            '<div>' + n + '</div>',
            '<div>' + i + '</div>'
        ].join('');
    }
    function m() {
        let e = c.purchases;
        p(
            BUY_SERVER,
            e.serverLevel === 0 ? 'Buy Firewall' : 'Upgrade Server',
            '+1 Security',
            'Cost: $' + store.getPrice(BUY_SERVER, e)
        );
        let t;
        e.proxy === PROXY_NONE ? (t = 'Buy Basic Proxy') : (t = 'Buy Enterprise Proxy');
        p(BUY_PROXY, t, '+4 Security', 'Cost: $' + store.getPrice(BUY_PROXY, e) + ' per turn');
        p(
            BUY_MINE,
            'Buy Crypto Mine',
            '+1 Money per turn',
            'Cost: $' + store.getPrice(BUY_MINE, e)
        );
        p(
            BUY_BOTNET,
            e.botnetLevel === 0 ? 'Buy BotNet' : 'Upgrade BotNet',
            '+1 Power',
            'Cost: $' + store.getPrice(BUY_BOTNET, e)
        );
        p(
            BUY_HACKER,
            'Hire hacker',
            '+3 Power (2 turns)',
            'Cost: $' + store.getPrice(BUY_HACKER, e)
        );
    }
    function f(e) {
        s.innerHTML = e;
    }
    function B(e) {
        return '<div>' + e + '</div>';
    }
    function h(e) {
        return [
            'Money: ' + e.money,
            'Power: ' + e.power,
            'Security: ' + e.security,
            'Availability: ' + e.availablity
        ].map(B);
    }
    function w() {
        a.innerHTML = [
            '<div class="stat-window">',
            '<h2>Your Stats</h2>',
            ...h(c.points),
            '</div>',
            '<div class="stat-window">',
            '<h2>Enemy Stats</h2>',
            ...h(d.points),
            '</div>'
        ].join('');
    }
    function E() {
        e.on('start', (e, n, o) => {
            (c = e),
                (d = n),
                (u = o + 1),
                console.log('Game start', e.purchases),
                l(i),
                y(r),
                y(t),
                w(),
                m(),
                v(),
                f('Turn ' + u);
        });
        e.on('state', e => {
            (c = e), console.log('State change', e), w(), m();
        });
        e.on('turn', (e, t, n) => {
            (c = e),
                (d = t),
                (u = n + 1),
                console.log('New turn', e.purchases),
                w(),
                m(),
                v(),
                f('Turn ' + u);
        });
        e.on('win', () => {
            y(i), l(r), g(), f('You win!');
        });
        e.on('lose', () => {
            y(i), l(r), g(), f('You lose!');
        });
        e.on('draw', () => {
            y(i), l(r), g(), f('Draw!');
        });
        e.on('end', () => {
            l(t), g(), f('Waiting for opponent...');
        });
        e.on('connect', () => {
            y(n), l(t), g(), f('Press Start to Begin');
        });
        e.on('disconnect', () => {
            l(t), g(), f('Connection lost!');
        });
        e.on('error', () => {
            l(t), g(), f('Connection error!');
        });
        n.addEventListener(
            'click',
            t => {
                f('Waiting for opponent...'), l(n), g(), e.emit('start');
            },
            !1
        );
        i.addEventListener(
            'click',
            t => {
                f('Waiting for rematch...'), l(i), g(), e.emit('restart');
            },
            !1
        );
        for (let t = 0; t < o.length; t++)
            ((t, n) => {
                n === END_TURN
                    ? t.addEventListener(
                          'click',
                          t => {
                              g(), e.emit('endTurn');
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
            })(o[t], t);
    }
    function b() {
        e = io({ upgrade: !1, transports: ['websocket'] });
        t = document.getElementById('game');
        n = document.getElementById('start');
        i = document.getElementById('restart');
        r = document.getElementById('buttons');
        o = r.getElementsByTagName('button');
        s = document.getElementById('message');
        a = document.getElementById('stats');
        l(i);
        g();
        E();
    }
    window.addEventListener('load', b, !1);
})();

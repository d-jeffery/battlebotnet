'use strict';
!(function() {
    let e,
        n,
        t,
        o,
        i,
        r,
        s,
        a = 0,
        u = { win: 0, lose: 0, draw: 0 };
    function c() {
        for (let e = 0; e < n.length; e++) n[e].setAttribute('disabled', 'disabled');
    }
    function d() {
        for (let e = 0; e < n.length; e++) n[e].removeAttribute('disabled');
    }
    function l(e, t, o, i) {
        n[e].innerHTML = [
            '<div>' + t + '</div>',
            '<div>' + o + '</div>',
            '<div>' + i + '</div>'
        ].join('');
    }
    function y() {
        let e = r.purchases;
        l(
            BUY_SERVER,
            e.serverLevel === 0 ? 'Buy Firewall' : 'Upgrade Server',
            '+1 Security',
            'Cost: $' + store.getPrice(BUY_SERVER, e)
        );
        let n;
        e.proxy === PROXY_NONE ? (n = 'Buy Basic Proxy') : (n = 'Buy Enterprise Proxy');
        l(BUY_PROXY, n, '+4 Security', 'Cost: $' + store.getPrice(BUY_PROXY, e) + ' per turn');
        l(
            BUY_MINE,
            'Buy Crypto Mine',
            '+1 Money per turn',
            'Cost: $' + store.getPrice(BUY_MINE, e)
        );
        l(
            BUY_BOTNET,
            e.botnetLevel === 0 ? 'Buy BotNet' : 'Upgrade BotNet',
            '+1 Power',
            'Cost: $' + store.getPrice(BUY_BOTNET, e)
        );
        l(
            BUY_HACKER,
            'Hire hacker',
            '+3 Power (2 turns)',
            'Cost: $' + store.getPrice(BUY_HACKER, e)
        );
    }
    function g(e) {
        t.innerHTML = e;
    }
    function v(e) {
        return '<div>' + e + '</div>';
    }
    function p(e) {
        return [
            'Money: ' + e.money,
            'Power: ' + e.power,
            'Security: ' + e.security,
            'Availability: ' + e.availablity
        ].map(v);
    }
    function w() {
        o.innerHTML = [
            '<div class="stat-window">',
            '<h2>Your Stats</h2>',
            ...p(r.points),
            '</div>',
            '<div class="stat-window">',
            '<h2>Enemy Stats</h2>',
            ...p(s.points),
            '</div>'
        ].join('');
    }
    function f() {
        o.innerHTML = [];
    }
    function h(e) {
        i.innerHTML = [
            '<h2>' + e + '</h2>',
            'Won: ' + u.win,
            'Lost: ' + u.lose,
            'Draw: ' + u.draw
        ].join('<br>');
    }
    function m() {
        e.on('start', (e, n, t) => {
            (r = e),
                (s = n),
                (a = t + 1),
                console.log('Game start', e.purchases),
                w(),
                y(),
                d(),
                g('Turn ' + a);
        });
        e.on('state', e => {
            (r = e), console.log('State change', e), w(), y();
        });
        e.on('turn', (e, n, t) => {
            (r = e),
                (s = n),
                (a = t + 1),
                console.log('New turn', e.purchases),
                w(),
                y(),
                d(),
                g('Turn ' + a);
        });
        e.on('win', () => {
            u.win++, h('You win!');
        });
        e.on('lose', () => {
            u.lose++, h('You lose!');
        });
        e.on('draw', () => {
            u.draw++, h('Draw!');
        });
        e.on('end', () => {
            f(), c(), g('Waiting for opponent...');
        });
        e.on('connect', () => {
            f(), c(), g('Waiting for opponent...');
        });
        e.on('disconnect', () => {
            f(), c(), g('Connection lost!');
        });
        e.on('error', () => {
            c(), g('Connection error!');
        });
        for (let t = 0; t < n.length; t++)
            ((n, t) => {
                t === END_TURN
                    ? n.addEventListener(
                          'click',
                          n => {
                              c(), e.emit('endTurn');
                          },
                          !1
                      )
                    : n.addEventListener(
                          'click',
                          n => {
                              e.emit('purchase', t);
                          },
                          !1
                      );
            })(n[t], t);
    }
    function B() {
        e = io({ upgrade: !1, transports: ['websocket'] });
        n = document.getElementsByTagName('button');
        t = document.getElementById('message');
        o = document.getElementById('stats');
        i = document.getElementById('results');
        c();
        m();
    }
    window.addEventListener('load', B, !1);
})();

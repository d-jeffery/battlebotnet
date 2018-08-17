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
        c = { win: 0, lose: 0, draw: 0 };
    function u() {
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
            0,
            e.botnetLevel === 0 ? 'Buy BotNet' : 'Upgrade BotNet',
            '+1 Power',
            'Cost: $' + store.getPrice(0, e)
        );
        l(1, 'Hire hacker', '+1 Power', 'Cost: $' + store.getPrice(1, e));
        l(2, 'Buy Firewall', '+1 Security', 'Cost: $' + store.getPrice(2, e));
        l(3, 'Upgrade Server', '+1 Security', 'Cost: $' + store.getPrice(3, e));
        let n;
        e.proxy === PROXY_NONE ? (n = 'Buy Basic Proxy') : (n = 'Buy Enterprise Proxy');
        l(4, n, '+5 Security', 'Cost: $' + store.getPrice(4, e) + ' per turn');
        l(5, 'Buy Crypto Mine', '+1 Money per turn', 'Cost: $' + store.getPrice(5, e));
    }
    function g(e) {
        t.innerHTML = e;
    }
    function p(e) {
        return '<div>' + e + '</div>';
    }
    function v(e) {
        return [
            'Money: ' + e.money,
            'Power: ' + e.power,
            'Security: ' + e.security,
            'Availability: ' + e.availablity
        ].map(p);
    }
    function w() {
        o.innerHTML = [
            '<div class="stat-window">',
            '<h2>Your Stats</h2>',
            ...v(r.points),
            '</div>',
            '<div class="stat-window">',
            '<h2>Enemy Stats</h2>',
            ...v(s.points),
            '</div>'
        ].join('');
    }
    function f() {
        o.innerHTML = [];
    }
    function h(e) {
        i.innerHTML = [
            '<h2>' + e + '</h2>',
            'Won: ' + c.win,
            'Lost: ' + c.lose,
            'Draw: ' + c.draw
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
            c.win++, h('You win!');
        });
        e.on('lose', () => {
            c.lose++, h('You lose!');
        });
        e.on('draw', () => {
            c.draw++, h('Draw!');
        });
        e.on('end', () => {
            f(), u(), g('Waiting for opponent...');
        });
        e.on('connect', () => {
            f(), u(), g('Waiting for opponent...');
        });
        e.on('disconnect', () => {
            f(), u(), g('Connection lost!');
        });
        e.on('error', () => {
            u(), g('Connection error!');
        });
        for (let t = 0; t < n.length; t++)
            ((n, t) => {
                t === END_TURN
                    ? n.addEventListener(
                          'click',
                          n => {
                              u(), e.emit('endTurn');
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
        u();
        m();
    }
    window.addEventListener('load', B, !1);
})();

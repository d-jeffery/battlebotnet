// @flow
'use strict';

(function() {
    let socket, //Socket.IO client
        game, // Game element
        startButton, // Start button
        restartButton, // Restart button
        buttonsDiv, // The div wrapper around buttons
        buttons, //Button elements
        message, //Message element
        stats, //Status element
        playerState,
        enemyState,
        turn = 0;

    /**
     * Hide an element.
     * @param {HTMLElement} e
     */
    function hide(e) {
        e.style.display = 'none';
    }

    /**
     * Show an element.
     * @param {HTMLElement} e
     */
    function show(e) {
        e.style.display = 'inline-block';
    }

    /**
     * Disable all button
     */
    function disableButtons() {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].setAttribute('disabled', 'disabled');
        }
    }

    /**
     * Enable all button
     */
    function enableButtons() {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].removeAttribute('disabled');
        }
    }

    /**
     * Update the button text.
     * @param {number} buttonNum
     * @param {string} title
     * @param {string} text
     * @param {string} cost
     */
    function updateButtonText(buttonNum, title, text, cost) {
        buttons[buttonNum].innerHTML = [
            '<div>' + title + '</div>',
            '<div>' + text + '</div>',
            '<div>' + cost + '</div>'
        ].join('');
    }

    /**
     * Update the buttons.
     */
    function updateButtons() {
        const p = playerState.purchases;

        // Server
        updateButtonText(
            BUY_SERVER,
            p.serverLevel === 0 ? 'Buy Firewall' : 'Upgrade Server',
            '+1 Security',
            'Cost: $' + store.getPrice(BUY_SERVER, p)
        );

        // Proxy
        let proxyText;
        if (p.proxy === PROXY_NONE) {
            proxyText = 'Buy Basic Proxy';
        } else {
            proxyText = 'Buy Enterprise Proxy';
        }
        updateButtonText(
            BUY_PROXY,
            proxyText,
            '+4 Security',
            'Cost: $' + store.getPrice(BUY_PROXY, p) + ' per turn'
        );

        // Crypto mine
        updateButtonText(
            BUY_MINE,
            'Buy Crypto Mine',
            '+1 Money per turn',
            'Cost: $' + store.getPrice(BUY_MINE, p)
        );

        // Battlenet
        updateButtonText(
            BUY_BOTNET,
            p.botnetLevel === 0 ? 'Buy BotNet' : 'Upgrade BotNet',
            '+1 Power',
            'Cost: $' + store.getPrice(BUY_BOTNET, p)
        );

        // Hacker
        updateButtonText(
            BUY_HACKER,
            'Hire hacker',
            '+3 Power (2 turns)',
            'Cost: $' + store.getPrice(BUY_HACKER, p)
        );

        for (let i = 0; i < buttons.length - 1; i++) {
            if (!store.canBuy(i, playerState)) {
                buttons[i].setAttribute('disabled', 'disabled');
            }
        }
    }

    /**
     * Set message text
     * @param {string} text
     */
    function setMessage(text) {
        message.innerHTML = text;
    }

    /**
     * Wraps line in divs
     * @param {string} l
     * @returns {string}
     */
    function formatLine(l) {
        return '<div>' + l + '</div>';
    }

    /**
     * Print points.
     * @param {Points} p
     * @returns {string[]}
     */
    function formatPoints(p) {
        return [
            'Money: ' + p.money,
            'Power: ' + p.power,
            'Security: ' + p.security,
            'Availability: ' + p.availablity
        ].map(formatLine);
    }

    /**
     * Set score text
     */
    function updateStats() {
        stats.innerHTML = [
            '<div class="stat-window">',
            '<h2>Your Stats</h2>',
            ...formatPoints(playerState.points),
            '</div>',
            '<div class="stat-window">',
            '<h2>Enemy Stats</h2>',
            ...formatPoints(enemyState.points),
            '</div>'
        ].join('');
    }

    /**
     * Bind Socket.IO and button events
     */
    function bind() {
        socket.on('start', (s, os, t) => {
            playerState = s;
            enemyState = os;
            turn = t + 1;
            console.log('Game start', s.purchases);
            hide(restartButton);
            show(buttonsDiv);
            show(game);
            updateStats();
            enableButtons();
            updateButtons();
            setMessage('Turn ' + turn);
        });

        socket.on('state', s => {
            playerState = s;
            console.log('State change', s);
            updateStats();
            updateButtons();
        });

        socket.on('turn', (s, os, t) => {
            playerState = s;
            enemyState = os;
            turn = t + 1;
            console.log('New turn', s.purchases);
            updateStats();
            enableButtons();
            updateButtons();
            setMessage('Turn ' + turn);
        });

        socket.on('win', () => {
            show(restartButton);
            hide(buttonsDiv);
            disableButtons();
            setMessage('You win!');
        });

        socket.on('lose', () => {
            show(restartButton);
            hide(buttonsDiv);
            disableButtons();
            setMessage('You lose!');
        });

        socket.on('draw', () => {
            show(restartButton);
            hide(buttonsDiv);
            disableButtons();
            setMessage('Draw!');
        });

        socket.on('end', () => {
            hide(game);
            disableButtons();
            setMessage('Waiting for opponent...');
        });

        socket.on('connect', () => {
            show(startButton);
            hide(game);
            disableButtons();
            setMessage('Press Start to Begin');
        });

        socket.on('disconnect', () => {
            hide(game);
            disableButtons();
            setMessage('Connection lost!');
        });

        socket.on('error', () => {
            hide(game);
            disableButtons();
            setMessage('Connection error!');
        });

        startButton.addEventListener(
            'click',
            e => {
                setMessage('Waiting for opponent...');
                hide(startButton);
                disableButtons();
                socket.emit('start');
            },
            false
        );

        restartButton.addEventListener(
            'click',
            e => {
                setMessage('Waiting for rematch...');
                hide(restartButton);
                disableButtons();
                socket.emit('restart');
            },
            false
        );

        for (let i = 0; i < buttons.length; i++) {
            ((button, option) => {
                if (option === END_TURN) {
                    button.addEventListener(
                        'click',
                        e => {
                            disableButtons();
                            socket.emit('endTurn');
                        },
                        false
                    );
                } else {
                    button.addEventListener(
                        'click',
                        e => {
                            socket.emit('purchase', option);
                        },
                        false
                    );
                }
            })(buttons[i], i);
        }
    }

    /**
     * Client module init
     */
    function init() {
        socket = io({ upgrade: false, transports: ['websocket'] });
        game = document.getElementById('game');
        startButton = document.getElementById('start');
        restartButton = document.getElementById('restart');
        buttonsDiv = document.getElementById('buttons');
        buttons = buttonsDiv.getElementsByTagName('button');
        message = document.getElementById('message');
        stats = document.getElementById('stats');
        hide(restartButton);
        disableButtons();
        bind();
    }

    window.addEventListener('load', init, false);
})();

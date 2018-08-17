// @flow
'use strict';

(function() {
    let socket, //Socket.IO client
        buttons, //Button elements
        message, //Message element
        stats, //Status element
        results, //Results element
        playerState,
        enemyState,
        turn = 0,
        score = {
            win: 0,
            lose: 0,
            draw: 0
        };

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
    function displayStats() {
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
     * Hide stats.
     */
    function hideStates() {
        stats.innerHTML = [];
    }

    /**
     * Set score text
     * @param {string} text
     */
    function displayScore(text) {
        results.innerHTML = [
            '<h2>' + text + '</h2>',
            'Won: ' + score.win,
            'Lost: ' + score.lose,
            'Draw: ' + score.draw
        ].join('<br>');
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
            displayStats();
            enableButtons();
            setMessage('Turn ' + turn);
        });

        socket.on('state', s => {
            playerState = s;
            console.log('State change', s);
            displayStats();
        });

        socket.on('turn', (s, os, t) => {
            playerState = s;
            enemyState = os;
            turn = t + 1;
            console.log('New turn', s.purchases);
            displayStats();
            enableButtons();
            setMessage('Turn ' + turn);
        });

        socket.on('win', () => {
            score.win++;
            displayScore('You win!');
        });

        socket.on('lose', () => {
            score.lose++;
            displayScore('You lose!');
        });

        socket.on('draw', () => {
            score.draw++;
            displayScore('Draw!');
        });

        socket.on('end', () => {
            hideStates();
            disableButtons();
            setMessage('Waiting for opponent...');
        });

        socket.on('connect', () => {
            hideStates();
            disableButtons();
            setMessage('Waiting for opponent...');
        });

        socket.on('disconnect', () => {
            hideStates();
            disableButtons();
            setMessage('Connection lost!');
        });

        socket.on('error', () => {
            disableButtons();
            setMessage('Connection error!');
        });

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
        buttons = document.getElementsByTagName('button');
        message = document.getElementById('message');
        stats = document.getElementById('stats');
        results = document.getElementById('results');
        disableButtons();
        bind();
    }

    window.addEventListener('load', init, false);
})();

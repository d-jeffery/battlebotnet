'use strict';

(function() {
    let socket, //Socket.IO client
        buttons, //Button elements
        message, //Message element
        stats, //Score element
        results,
        points = new Points(),
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
     * Set score text
     */
    function displayStats() {
        stats.innerHTML = [
            '<h2>Your Stats</h2>',
            'Income: ' + points.income,
            'Money: ' + points.money,
            'Power: ' + points.power,
            'Security: ' + points.security,
            'Availability: ' + points.availablity
        ].join('<br>');
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
        socket.on('start', () => {
            points = new Points();
            enableButtons();
            setMessage('Round ' + (score.win + score.lose + score.draw + 1));
        });

        socket.on('turn', () => {
            displayStats();
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
            disableButtons();
            setMessage('Waiting for opponent...');
        });

        socket.on('connect', () => {
            disableButtons();
            setMessage('Waiting for opponent...');
        });

        socket.on('disconnect', () => {
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
                            disableButtons();
                            socket.emit('guess', option);
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
        displayStats();
        disableButtons();
        bind();
    }

    window.addEventListener('load', init, false);
})();

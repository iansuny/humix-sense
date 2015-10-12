var agent = require('./agent'),
    fs = require('fs'),
    log = require('logule').init(module, 'App');

process.on('SIGTERM', function() {
    if (agent.getState() === 'RUNNING') {
        agent.stop();
    }
});

var senseId = process.argv[2] || undefined;
if (!senseId) {
    try {
        senseId = fs.readFileSync('./sense.txt').toString().trim();
    } catch (e) {
        log.error('Error: '+e);
        process.exit(-1);
    }
}

try {
    agent.init('http://localhost:1880/comms', senseId, {autoreconnect: true});
    agent.start();
} catch (e) {
    log.error('Error: '+e);
}

agent.events.on('moduleCommand', function(command) {
    log.info('Command: '+command);
});

// for testing
setInterval(function() {
    if (agent.getState() === 'RUNNING') {
        agent.publish('temp', JSON.stringify({
            currentTemp: 25
        }));
    }
}, 3000);

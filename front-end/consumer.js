var amqp = require('amqplib/callback_api');
const uri = 'amqp://admin:admin@localhost:5672/VTO';
const im = require('imagemagick');
const { spawn } = require("child_process");
const { v4: uuidv4 } = require('uuid');

amqp.connect(uri, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'hello';

        channel.assertQueue(queue, {
            durable: false
        });
	channel.prefetch(1)

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, function(msg) {
            try{
                console.log(" [x] Received %s", msg.content.toString());
                var obj=JSON.parse( msg.content.toString())
                var id = obj.id
                im.convert([obj.dataImage, '-alpha', 'off', `./noalpha/temp_noalpha_${id}.jpg`],
                function(err, stdout){
                    if (err) {
                        console.log(err);
                        throw(err);
                    }
                    console.log('stdout:', stdout);
                    var param1 = `./noalpha/temp_noalpha_${id}.jpg`
                    var param2 = 'public/images/clothes/'+obj.selectedCloth
                    var cmd = '../back-end/ClothesTryOn/smartfit/run_smartfit.sh'
                    console.log(process.cwd());
                    console.log(cmd);
                    const smartfit = spawn(cmd, [param1, param2, id]);
                    smartfit.stdout.on('data', (data) => {
                    console.log(`stdout: ${data}`);
                    });
                    smartfit.stderr.on('data', (data) => {
                    console.log(`stderr: ${data}`);
                    });
                    smartfit.on('error', function (error) {
                        // exit code is code
                        console.log(`error: ${error}`);
                        throw(error);
                    });
                    smartfit.on('close', function (code) {
                        // exit code is code
                        console.log('finished', code);
                        channel.ack(msg);
                        //res.json({id});
                    });
                })
            }
            catch (e) {
                channel.nack(msg);
                console.log("Error", e);
                res.send(e);
            }
        });
    });
});

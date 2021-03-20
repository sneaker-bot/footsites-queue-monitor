const config = require('./config.json');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const got = require('got');
const webhook = require('webhook-discord');
const Hook = new webhook.Webhook(config['webhook']);

var site_url = config['url'];
var monitor_status = true; 
var error = false;
var monitor_delay = config['monitor_delay'];
var error_delay = config['error_delay'];

async function send_hook(){

	const msg = new webhook.MessageBuilder()
                .setName('Queue monitor')
                .setText(`detected queue, site :${site_url}`);

	Hook.send(msg).catch(() => {
		console.log('Failed to send webhook');
	});

};

async function monitor(){

	if(!monitor_status){

		console.log('detected queue');
		await send_hook();
		return;
	
	}else if(error){

		error = false;
		await sleep(error_delay);

	}else{

		await sleep(monitor_delay);
	};

	console.log('Monitoring for queue');

	var get = await got.get(site_url, {

		headers : {

			    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			    "accept-language": "en",
			    "cache-control": "no-cache",
			    "pragma": "no-cache",
			    "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
			    "sec-ch-ua-mobile": "?0",
			    "sec-fetch-dest": "document",
			    "sec-fetch-mode": "navigate",
			    "sec-fetch-site": "none",
			    "sec-fetch-user": "?1",
			    "upgrade-insecure-requests": "1",
			    "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"

		}

	}).catch(() => {

		error = true;
	});

	var status_code = get.statusCode; 

	if(status_code == 503){

		monitor_status = false;
		await monitor();
	}else{

		await monitor();
	};
};

monitor().catch(() => {
	console.log('Error starting monitor');
});
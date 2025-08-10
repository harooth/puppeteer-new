const puppeteer = require("puppeteer");
require("dotenv").config();
const axios = require("axios")

const TOKEN = process.env.TOKEN;
const CHAT_ID_BALANCE = process.env.CHAT_ID_BALANCE; //tg balance chat ID
const CHAT_ID_STATUS = process.env.CHAT_ID_STATUS; //tg status(working/not working) chat ID
const URI_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`; // the 

function delay(time) {
   return new Promise(function(resolve) { 
	   setTimeout(resolve, time)
   });
}

async function getState() {
	const element = await page.waitForSelector('tbody'); // select the elements of devices table;
	let totalElem = await page.waitForSelector('#total_int'); // select the element of total count;

	let total = await totalElem.evaluate(el => el.textContent); //find total count
	let data = await element.evaluate(function (el) { // collect the data of { devices: working status }
		let obj = {}

		for(let i = 0; i < el.children.length; i++) {
			let key = el.children[i].children[0].children[0].innerHTML.trim();
			let value = el.children[i].children[4].children[0].innerHTML.trim();
			obj[key] = value;
		}
		return obj;
	});
	data.total = total;

	return data
}

function sendMessage(chat_id, text) {
	axios.post(URI_API, {
		chat_id: chat_id,
		text: text
	})
}

const scrapeLogic = async (res) => {
		try {
			const browser = await puppeteer.launch({
			// headless: false,
			// args: ['--start-maximized'],
			// args: [
			// 	"--disable-setuid-sandbox",
			// 	"--no-sandbox",
			// 	"--single-process",
			// 	"--no-zygote"
			// ],
			executablePath: 
				process.env.NODE_ENV === "production" 
				? process.env.PUPPETEER_EXECUTABLE_PATH 
				: puppeteer.executablePath(),
		});
		const page = await browser.newPage();
		Object.prototype.page = page;

		await page.goto('https://manage64.net/en');

		// Set screen size
		await page.setViewport({ width: 2000, height: 1500});

		// Type into email input field
		await page.type('input[type=email]', process.env.EMAIL);

		await delay(500)
		// Type into password input field
		await page.type('input[type=password]', process.env.PASSWORD);

		// await page.waitForTimeout(4000)
		await delay(1000)

		const loginBTN = "#login > .btn-primary"
		await page.click(loginBTN);

		while(true) {
			let data = await getState();
			total = data.total;
			await sendMessage(CHAT_ID_BALANCE, total);

			for(let deviceID in data) {
				if(deviceID != "total" && deviceID != "page") {
					if(data[deviceID] != "Active") {
						await sendMessage(CHAT_ID_STATUS, `${deviceID} is not working`);
						break
					}

				}
			}

			await delay(300000);
			await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

		}
		
		// res.send(total);
	} catch(e) {
		console.error(e)
		res.send(`Something went wrong while running puppeteer: ${e}`)
	} finally {
		await browser.close();
		res.send("exav")
	}



}

module.exports = {
	scrapeLogic
}
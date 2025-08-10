const puppeteer = require("puppeteer")

const scrapeLogic = async (res) => {
	const browser = await puppeteer.launch();

	try {
		const page = await browser.newPage();
		// throw new Error("whooops!")
		await page.goto('https://manage64.net/en');

		await page.setViewport({ width: 2000, height: 1500});

		const element = await page.waitForSelector('#switcher-home-tab');
		// let element = await page.evaluate(el => el.textContent);
		let total = await element.evaluate(el => el.textContent);
		console.log(total.trim());
		
		res.send(total);
	} catch(e) {
		console.error(e)
		res.send(`Something went wrong while running puppeteer: ${e}`)
	} finally {
		await browser.close();
	}

	
}

module.exports = { scrapeLogic }
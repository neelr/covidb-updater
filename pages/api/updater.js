import chrome from 'chrome-aws-lambda'
import puppeteer from "puppeteer";
import db from "../../lib/firebase"

export default async (req, res) => {

    const browser = await puppeteer.launch(
        process.env.NODE_ENV === 'production'
            ? {
                args: chrome.args,
                defaultViewport: chrome.defaultViewport,
                executablePath: await chrome.executablePath,
                headless: chrome.headless,
                ignoreHTTPSErrors: true,
            }
            : {}
    )

    const page = await browser.newPage();

    await page.goto("https://www.arcgis.com/apps/opsdashboard/index.html#/5c7f096096ed482395f6a626150366e2");
    setTimeout(async () => {
        const text = await page.evaluate(() => [...document.getElementsByTagName("text")].map(v => v.innerHTML));
        await browser.close();

        let currentStats = {}

        let key = ""
        text.map((v, i) => {
            if (i % 2 == 1) {
                currentStats[key] = v
            } else {
                key = v
            }
        })

        await db.ref("stats/current").set(currentStats)

        res.send(currentStats)
    }, 5000)
}
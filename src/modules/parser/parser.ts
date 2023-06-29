import puppeteer, { Browser } from 'puppeteer';
import EventEmitter from "events";
import {coins} from "../../config/config";

export type Pair = {
    buy: string,
    sell: string,
    arb: string
}

export class Parser {
    private browser: Browser;
    private readonly events: Map<string, EventEmitter> = new Map();
    private readonly coinData: Map<string, Pair[]> = new Map();

    public async startBrowser() {
        this.browser = await puppeteer.launch({
            headless: true,
        });

        for (const c of coins) {
            const event = new EventEmitter();
            this.events.set(c.key, event)
            await this.parse(c.url, c.key, event);
        }
    }

    public getEvent(coin: string) {
        const event = this.events.get(coin);
        if (!event) {
            return new Error('No coin found');
        }
        return event;
    }

    public getCoinData(coin: string) {
        const data = this.coinData.get(coin);
        if (!data) {
            return new Error('No coin data found');
        }
        return data;
    }

    private async parse(url: string, key: string, event: EventEmitter) {
        const page = await this.browser.newPage();
        await page.goto(url);

        await page.waitForSelector('tr.sc-7588c219-4');

        const rows = await page.$$('tr.sc-7588c219-4');

        event.on('close', async () => {
            clearInterval(interval);
            await page.close();
        });

        const interval = setInterval(async () => {
            const result = [];
            const sellers = [];
            const buyers = [];

            const sellersSelector = await page.$$('.sc-7588c219-1 > th');

            for (const seller of sellersSelector) {
                const s = String(await seller.evaluate(el => el.textContent)).split('$')[0]
                if (s) {
                    sellers.push(s);
                }
            }

            for (let i = 0; i < rows.length; i++) {
                const buyerSelector = await page.$(`tr.sc-7588c219-4:nth-child(${i + 1}) > th:nth-child(1)`);
                const b = String(await buyerSelector!.evaluate(el => el.textContent)).split('$')[0]
                if (b) {
                    buyers.push(b);
                }
            }

            for (let i = 0; i < rows.length; i++) {
                for (let j = 0; j < rows.length; j++) {
                    const arbSelector = await page.$(`tr.sc-7588c219-4:nth-child(${i + 1}) > td:nth-child(${j + 2}) > span:nth-child(1)`);
                    const pair: Pair = {
                        buy: buyers[i],
                        sell: sellers[j],
                        arb: (await arbSelector!.evaluate(el => el.textContent)) as string,
                    };
                    result.push(pair);
                }
            }
            this.coinData.set(key, result);
            event.emit('data', result);
        }, 30000);
        return;
    };
}
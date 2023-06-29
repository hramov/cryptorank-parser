import * as cheerio from 'cheerio';
import axios from 'axios';

export class Crawler {
    constructor() {}

    public async parseTable(urls: string[]) {
        const table = [];

        const page = await this.getPage(urls[0]);

        const $ = cheerio.load(page);

        const headerCols = $('.sc-7588c219-1 > th').length;

        for (let i = 0; i < headerCols; i++) {
            console.log($(`.sc-7588c219-1 > th:nth-child(${i + 1})`).html())
            const row = {
                name: $(`th.sc-e17fa6bf-2:nth-child(${i + 1}) > a:nth-child(1)`).text(),
                price: $(`th.sc-e17fa6bf-2:nth-child(${i + 1})`).text(),
                to: $(`th.sc-e17fa6bf-2:nth-child(${i + 1}) > p:nth-child(4)`).text(),
            };

            table.push(row);
        }

        return table;
    }

    public async parseNext(urls: string[]) {
        const data = [];

        for (const url of urls) {
            const page = await this.getPage(url);
            if (page instanceof Error) {
                console.log(`Cannot parse ${url}`)
                continue;
            }

            const $ = cheerio.load(page);
            const nextData = JSON.parse($('#__NEXT_DATA__').text());

            const pageProps = nextData.props.pageProps;
            const coin = pageProps.coin;
            const tickers = pageProps.tickers;
            const globalData = pageProps.initData.globalData;

            data.push({
                key: coin.key,
                coin,
                tickers,
                globalData
            });
        }

        return data;

    }

    private async getPage(url: string) {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0',
                'Cookie': 'theme=light; G_ENABLED_IDPS=google',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });
        if (response.status >= 400) {
            return new Error('Cannot proceed query');
        }
        return response.data;
    }
}
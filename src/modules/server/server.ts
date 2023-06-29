import express from 'express';
import cors from 'cors';
import {Pair, Parser} from "../parser/parser";

export async function startServer(port: number) {
    const app = express();
    app.use(cors());

    const parser = new Parser();
    await parser.startBrowser();

    app.get('/api/arbitrage/:coin', async (req, res) => {

        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const coin = req.params.coin;

        console.log('Got request to fetch ' + coin);

        const event = parser.getEvent(coin);

        if (event instanceof Error) {
            res.end(event.message);
            return;
        }

        const listener = (data: Pair[]) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        event.on('data', listener);

        const storedData = parser.getCoinData(coin);

        if (storedData instanceof Error) {
            console.log(storedData.message);
        } else {
            res.write(`data: ${JSON.stringify(storedData)}\n\n`)
        }

        res.on('close', () => {
            console.log('Got request to cancel ' + coin);
            event.removeListener('data', listener);
            res.end();
        });
    });

    app.listen(port, () => console.log('Server started on port ' + port));
}
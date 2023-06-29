import  { config } from 'dotenv'
import {startServer} from "../modules/server/server";
config();

export class App {
    async bootstrap() {
        await startServer(3000);
    }
}

const app = new App();
app.bootstrap().catch(err => console.log(err));
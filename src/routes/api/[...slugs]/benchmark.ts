import { Elysia } from 'elysia';
import type { Context } from "elysia";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';

interface CF extends Context {
    platform: App.Platform;
    locals: App.Locals;
}

const benchmarkApp = new Elysia({ aot: false, prefix: '/benchmark' });

benchmarkApp
    .get('/', async (c:CF) => {
        return {
            message: 'Hello World'
        };
    })
    .post('/kv', async (c:CF) => {
        let result1 = {} as {write: number, read: number};
        let start = Date.now();
        for (let i = 0; i < 10; i++) {
            await c.platform?.env.benchmark.put("test"+i, "test"+i, {expirationTtl: 600});
        }
        let end = (Date.now()-start)/10;
        result1.write= end
        start = Date.now();
        for (let i = 0; i < 10; i++) {
            await c.platform?.env.benchmark.get("test"+i);
        }
        end = (Date.now()-start)/10;
        result1.read= end
        return  result1;
    })
    .post('/d1', async (c:CF) => {
		const db = drizzle(c.platform?.env.DB as D1Database, {schema});
        const user = c.locals.user
        let result1 = {} as {write: number, read: number, delete: number};
        let start = Date.now();
        for (let i = 0; i < 10; i++) {
            await db.insert(schema.carsTable).values({
                id: "test"+i,
                userId: user.id,
                make: "Toyota",
                model: "Corolla",
                year: 2022,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }
        let end = (Date.now()-start)/10;
        result1.write= end
        start = Date.now();
        for (let i = 0; i < 10; i++) {
            const car = await db.query.carsTable.findFirst({
                where: eq(schema.carsTable.id, "test"+i)
            });
            const cars = await db.query.carsTable.findMany({
                where: eq(schema.carsTable.userId, user.id)
            });
        }
        end = (Date.now()-start)/20;
        result1.read= end
        start = Date.now();
        for (let i = 0; i < 10; i++) {
            await db.delete(schema.carsTable).where(eq(schema.carsTable.id, "test" + i));
        }
        end = (Date.now()-start)/10;
        result1.delete= end
        
        return  result1;
    });


export default benchmarkApp;
import * as express from 'express';
import { Request, Response } from "express";
import { Saying } from '../../entity/Saying';
import { getConnection } from 'typeorm';
import { User } from '../../entity/User';
let router = express.Router();

router.get("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const sayings = await connection.getRepository(Saying).find();
        res.json(sayings.map(item => item.id));
    } catch (error) {
        res.status(500);
    }
});

router.get("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const saying = await connection.getRepository(Saying).findOne(req.params.id);
        res.json(saying);
    } catch (error) {
        res.status(500);
    }
});

router.post("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    let userID = req.cookies["user"];
    try {
        let user = await connection.getRepository(User).findOne(userID);
        try {
            let sayingInfo = new Saying();
            sayingInfo.user = user;
            sayingInfo.content = req.body.content;
            let saying = await connection.manager.save(sayingInfo);
            res.json(saying);
        } catch (error) {
            res.status(500);
        }
    } catch (error) {
        res.status(500);
    }
})

export default router;

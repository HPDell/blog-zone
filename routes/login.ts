import * as express from 'express';
import { Request, Response } from "express";
let router = express.Router();
import { getConnection, Raw } from 'typeorm';
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import { User } from "../entity/User";
import { join } from 'path';

router.post("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    let username = req.body.username as string;
    let password = req.body.password as string;
    try {
        let user = await connection.getRepository(User).findOne({
            where: {
                name: Raw(alias => `LOWER(${alias}) = '${username.toLowerCase()}'`),
                password: password
            },
            select: ["id", "name", "description", "avatar"]
        });
        if (user) {
            const now = moment();
            const token = jwt.sign({
                username: user.name,
                password: user.password,
                logintime: now.format("x")
            }, "blog-zone");
            try {
                user.token = token;
                user.lastLoginTime = now.toDate();
                await connection.manager.save(user);
            } catch (error) {
                console.log("Update user token error.")
            }
            res.json({
                ...user,
                token: token
            });
        } else {
            throw new Error("Username or Password error.");
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.get("/avatar/:path", function (req: Request, res: Response) {
    res.sendFile(join(__dirname, "../public/avatars", req.params.path));
})

router.post("/auto", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let user = await connection.getRepository(User).findOne({
            where: {
                token: req.body.token
            }
        });
        if (user) {
            const now = moment();
            try {
                user.lastLoginTime = now.toDate();
                await connection.manager.save(user);
            } catch (error) {
                console.log("Update user token error.")
            }
            res.json(user);
        } else {
            res.sendStatus(500);
            return;
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
})

router.post("/register", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let userList = await connection.getRepository(User).find();
        if (userList.length < 1) {    
            let userInfo = new User();
            userInfo.name = req.body.username;
            userInfo.password = req.body.password;
            userInfo.description = req.body.description;
            try {
                let user = await connection.manager.save(userInfo);
                res.json(user);
            } catch (error) {
                console.log(error);
                res.sendStatus(500);
                return;
            }
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
})

export default router;

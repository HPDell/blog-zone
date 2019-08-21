import * as express from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Request, Response } from "express";
let router = express.Router();
import { getConnection, Raw } from 'typeorm';
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import { User } from "../entity/User";
import { join } from 'path';

import * as multer from "multer";
import * as uuid from "uuid/v4";
import * as mime from "mime";
let storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: any) => void) {
        let dest = path.resolve(path.join(__dirname, "../../public", file.fieldname));
        fs.ensureDir(dest, (err) => {
            if (err) {
                callback(null, false);
            } else {
                callback(null, dest);
            }
        })
    },
    filename: function (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) {
        let filename = [req.cookies["user"], mime.getExtension(file.mimetype)].join(".");
        callback(null, filename);
    }
})
let upload = multer({
    storage: storage,
    limits: {
        fieldSize: 10485760
    }
})

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
            select: ["id", "name", "description", "avatar", "token", "canEdit", "canComment"]
        });
        if (user) {
            const now = moment();
            let token = user.token;
            if (!moment(user.lastLoginTime).isValid() || now.diff(moment(user.lastLoginTime), "days") > 30) {
                user.token = jwt.sign({
                    username: user.name,
                    password: user.password,
                    logintime: now.format("x")
                }, "blog-zone");
                token = user.token;
            }
            try {
                user.token = token ? token : jwt.sign({
                    username: user.name,
                    password: user.password,
                    logintime: now.format("x")
                }, "blog-zone");
                user.lastLoginTime = now.toDate();
                await connection.manager.save(user);
            } catch (error) {
                console.log("Update user token error.")
            }
            res.cookie("user", user.id);
            res.cookie("token", token);
            return res.json({
                ...user,
                token: user.token
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

router.post("/avatar/", upload.single("avatars"), async function (req: Request, res: Response) {
    const repository = getConnection().getRepository(User)
    let userId = req.cookies["user"];
    try {
        let user = await repository.findOne(userId);
        user.avatar = req.file.filename;
        try {
            let userInfo = await repository.save(user);
            return res.json(userInfo);
        } catch (error) {
            console.log(error);
            return res.sendStatus(500);
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
})

router.post("/auto", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let user = await connection.getRepository(User).findOne({
            where: {
                token: req.body.token
            },
            select: ["id", "name", "description", "avatar", "token", "canEdit", "canComment"]
        });
        if (user) {
            const now = moment();
            if (now.diff(user.lastLoginTime, "days") > 30) {
                res.sendStatus(500);
                return;
            }
            try {
                user.lastLoginTime = now.toDate();
                await connection.manager.save(user);
            } catch (error) {
                console.log("Update user token error.")
            }
            res.cookie("user", user.id);
            res.cookie("token", req.body.token);
            return res.json(user);
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
        // let userList = await connection.getRepository(User).find();
        let userInfo = new User();
        userInfo.name = req.body.username;
        userInfo.password = req.body.password;
        userInfo.description = req.body.description;
        userInfo.lastLoginTime = moment().toDate();
        userInfo.token = jwt.sign({
            username: userInfo.name,
            password: userInfo.password,
            logintime: moment(userInfo.lastLoginTime).format("x")
        }, "blog-zone");
        try {
            let user = await connection.manager.save(userInfo);
            res.cookie("user", user.id);
            res.cookie("token", userInfo.token);
            return res.json(user);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
})

export default router;

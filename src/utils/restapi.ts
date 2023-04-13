import { User } from '../entities';
import { verify } from 'jsonwebtoken'
import { createAccessToken } from './auth';

import express from 'express';

const router = express.Router();

router.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;

    if (!token) {
        return res.send({ ok: false, accessToken: '' })
    }

    let payload: any = null

    try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
        return res.send({ ok: false, accessToken: '' })
    }

    const user = await User.findOne({ where: { id: payload.userId } })

    if (!user) {
        return res.send({ ok: false, accessToken: '' })
    }

    if (user.tokenVersion != payload.tokenVersion) {
        return res.send({ ok: false, accessToken: '' })
    }

    return res.send({ ok: true, accessToken: createAccessToken(user) })
})

export default router;

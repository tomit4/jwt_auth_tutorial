require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')

app.use(express.json()) // make sure to invoke it

let refreshTokens = [] // not a good idea for production, soley for development purposes, represents our db or cache

// Web Dev says that normally you would want to store your refresh token in some form of a database or redis cache
app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401) // if the refreshToken doesn't exist, send 401 (can't find)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403) // or the "database" doesn't have the refreshToken in it (no access)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({
            name: user.name
        })
        res.json({
            accessToken: accessToken
        })
    })
})

// creates a way so that there can't be abuse of refresh tokens

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204) // successful delete
})


app.post('/login', (req, res) => {
    //Authenticate User (using username and bcrypt password)

    const username = req.body.username // req.payload.username in hapijs
    const user = {
        name: username
    }

    // generated using nodeJS by require('crypto').randomBytes(64).toString('hex')
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken) // stores our token in our "database"
    res.json({
        accessToken: accessToken,
        refreshToken: refreshToken
    })
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1m'
    })
}
// Run both servers and copy JWT from one login post request and then use received token to authenticate on second server, it WORKS, see below notes
app.listen(4000)

// the power of JSON Web Tokens (JWTs) is that they can talk witihin the browser regardless of what port they are being served over, this is unlike cookies, which are origin specific generally (I think), this is the basis over which OAuth is designed around
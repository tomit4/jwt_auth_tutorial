require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')

app.use(express.json()) // make sure to invoke it

const posts = [{
        username: 'Kyle',
        title: 'Post 1'
    },
    {
        username: 'Jim',
        title: 'Post 2'
    }
]

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // f authheader is undefined, return undefined, otherwise, split the headers and return to us the second one...
    if (token == null) return res.sendStatus(401) // otherwise send us a not found error

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403) // send us a expired token error (unauthorized error)
        req.user = user // otherwise assign the req.user to our user variable
        next()
    })
}

app.listen(3000)
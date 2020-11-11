const bcrypt = require('bcrypt');

module.exports = {

    register: async (req, res) => {

        const db = req.app.set('db');
        const { username, password, isAdmin} = req.body;
        const [result] = await db.get_user([username]);
        const user = [result]
        if (registeredUser){
            res.status(409).send('Username taken')
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const [user] = await db.register_user(isAdmin, username, hash)
        req.session.user = {
            isAdmin: user.is_admin,
            id: user.id,
            username: user.username
        }
        res.status(201).send(req.session.user)
    },

    login: async (req, res) => {

        const db = req.app.set('db');
        const { username, password } = req.body;
        const [foundUser] = await db.get_user([username]);
        if (!foundUser){
            res.status(401).send('User not found, please register as a new user before logging in.')
        }
        const isAuthenticated = bcrypt.compareSync(password, foundUser.hash)
        if (!isAuthenticated) {
            return res.status(403).send('Incorrect password')
        }
        req.session.foundUser = { isAdmin: foundUser.is_admin, id: foundUser.id, username: foundUser.username }
    },

    logout: async (req, res) => {

        req.session.destroy();
        return res.sendStatus(200)

    }
}
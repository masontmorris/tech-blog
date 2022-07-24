const router = require("express").Router();
const { User, Post, Comment } = require("../../models");

router.get("/", (req, res) => {
    User.findAll({
        attributes: { exclude: ["password"] },
    })
        .then((dbUserData) => res.json(dbUserData))
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});
router.get("/:id", (req, res) => {
    User.findOne({
        attributes: { exclude: ["password"] },
        where: {
            id: req.params.id,
        },
        include: [
            {
                model: Post,
                attributes: ["id", "title", "contents", "date_created"],
            },
            {
                model: Comment,
                attributes: ["id", "commentary", "date_created"],
                include: {
                    model: Post,
                    attributes: ["title"],
                },
            },
        ],
    })
        .then((dbUserData) => {
            if (!dbUserData) {
                res.status(404).json({ message: "User not found!" });
                return;
            }
            res.json(dbUserData);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post("/", (req, res) => {
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    }).then((dbUserData) => {
        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json(dbUserData);
        });
    });
});

router.post("/login", (req, res) => {
    User.findOne({
        where: {
            username: req.body.username,
        },
    }).then((dbUserData) => {
        if (!dbUserData) {
            res.status(400).json({ message: "We cannot find a user with this username!" });
            return;
        }

        const validPassword = dbUserData.checkPassword(req.body.password);

        if (!validPassword) {
            res.status(400).json({ message: "Incorrect password!" });
            return;
        }

        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json({ user: dbUserData, message: "Logged in successfully!" });
        });
    });
});

router.post("/logout", (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;

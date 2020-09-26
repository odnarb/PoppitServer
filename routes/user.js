//user routes

let express = require('express');
let router = express.Router();

// user/login
router.get('/login', (req, res) => {
    return res.render('pages/login',{
        data: {
            pageTitle: process.env.APP_NAME + ' | Login'
        }
    });
});

// user/login
router.post('/login', (req, res) =>{
    if( !req.body ){
        return res.status(400).json({reason: "no_params_sent"});
    } else if (!req.body.email){
        return res.status(400).json({ reason: "no_email" });
    } else if (!req.body.password){
        return res.status(400).json({ reason: "no_password" });
    }

    let userEmail = { email: req.body.email };
    Users.find(userEmail, (err,user) => {
        if(err){
            console.log( getTime() + " - DB User.find() error: ", err);
            return res.status(500).json({reason: "server_error"});
        }

        //user not found at all
        if ( user == undefined ){
            return res.status(400).json({reason: "no_user"});
        }

        if( bcrypt.compareSync(req.body.password, user.password_hash) ){

            //only check if the passwords match
            //user has not been activated
            if( user.active == 0 ){
                return res.status(400).json({reason: "not_active"});
            }

            req.session.regenerate( (err) => {
                console.log( getTime() + ' - : User logged IN' );
                req.session.isLoggedIn = true;
                req.session.user = user;
                if( req.body.remember && req.body.remember == "on" ){
                    req.session.cookie.maxAge = COOKIE_MAX_AGE;
                }
                return res.send({ result: user });
            });
        } else {
            return res.status(400).json({reason: "no_user"});
        }
    })
});

router.post('/signup', (req, res) => {
    console.log("signup query: ", req.query);
    console.log("signup params: ", req.params);
    console.log("signup body: ", req.body);

    return res.json({ register_params: true });
});


module.exports = router;

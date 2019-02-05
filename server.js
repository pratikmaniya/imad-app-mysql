var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');

var app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

var con = mysql.createConnection({
  host: "localhost",
  port: 3306, 
  user: "root",
  password: "",
  database: "imad"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var counter = 0;
app.get('/counter', function(req, res) {
    counter = counter + 1;
    res.send(counter.toString());    
});

function create(data){
    var s = data.toString();
    return s;
}

app.get('/ui/hometree/*', function(req,res) {
    var url = req.originalUrl;
  res.sendFile(path.join(__dirname, create(url)));
});

var names = [];
app.get('/submit-name', function (req, res) {
    var name = req.query.name;
    names.push(name);
    res.send(JSON.stringify(names));
});

function hash(input, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2","10000",salt,hashed.toString('hex')].join("$");
}

app.get('/hash/:input', function(req, res) {
    var hashedString = hash(req.params.input,'this-is-some-random-string');
    res.send(hashedString);
});

app.post('/create-user-from-home', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    console.log(dbString)
    con.query(`INSERT INTO user (username, password) VALUES ('${username}', '${dbString}')`, function(err, result) {
       if(err){
           console.log(err)
            res.status(500).send(err.toString());
        }    
        else{
            res.send('User successfully created: '+username);
        }     
    });
});

app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    con.query(`SELECT * FROM user WHERE username = '${username}'`, function(err, result) {
       if(err){
           console.log(err)
            res.status(500).send(err.toString());
        }    
        else{
            if(result.length === 0){
                res.status(403).send('username/password is invalid');
            }
            else{
                var dbString = result[0].password;
                var salt = dbString.split('$')[2];
                var hashedPassword = hash(password, salt);
                if(hashedPassword === dbString){
                    req.session.auth = {userId: result[0].id};
                    res.send('credentials correct!');
                }
                else{
                    res.status(403).send('username/password is invalid'); 
                }    
            }
        }     
    });
});

app.get('/check-login', function (req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
       con.query(`SELECT * FROM user WHERE id = ${req.session.auth.userId}`, [], function (err, result) {
           if (err) {
               console.log(err)
              res.status(500).send(err.toString());
           } else {
              res.send(result[0].username);    
           }
       });
   } else {
       res.status(203).send('You are not logged in');
       console.log('You are not logged in')
   }
});

app.get('/logout', function(req, res) {
    delete req.session.auth;
    res.send(`<a href="/"><h3>home</h3></a><br><a href="/ui/hometree/hometree1.html">home tree</a><br><br><h2>successfully logged out<h2>`);
});

app.get('/articles/:articleName', function(req,res) {
    var articleName = req.params.articleName;
    console.log(articleName);
    con.query(`SELECT * FROM article WHERE title = '${req.params.articleName}'`, function(err,result) {
        if(err){
            res.status(500).send(err.toString());
        }    
        else{
            if(result.length === 0){
                res.status(404).send('article not found');
            }
            else{
                var articleData = result[0];
                res.send(createTemplate(articleData));
            }    
        }    
    });
});

function create(data){
    var s = data.toString();
    return s;
}

app.get('/ui/hometree/*', function(req,res) {
    var url = req.originalUrl;
  res.sendFile(path.join(__dirname, create(url)));
});

app.get('/ui/hometree/style/*.css', function(req,res) {
    var url = req.originalUrl;
  res.sendFile(path.join(__dirname, create(url)));
});

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function createTemplate (data){
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;0
    var htmlTemplate = `
    <html>
    	<head>
    		<title>${title}</title>
    		<meta name="viewport" content="width=device-width,initial-scale=1"/>
    		<link href="/ui/style.css" rel="stylesheet" />
    	</head>
    	<body>
    	  <div class="container">
    		<a href="/">Home</a>
    		<hr/>
    		<h3>
    			${heading}
    		</h3>
    		<div>
    			${date.toDateString()}
    		</div>
    		<div>
    			${content}
    		</div>
    		 <hr/>
              <h4>Comments</h4>
              <div id="comment_form">
             
              </div>
              <div id="comments">
                <center>Loading comments...</center>
              </div>
    	  </div>
    	   <script type="text/javascript" src="/ui/article.js"></script>
    	</body>
    </html> 
    `;
    return htmlTemplate;
}

app.get('/get-articles', function (req, res) {
   // make a select request
   // return a response with the results
   con.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
        //   console.log(JSON.stringify(result));
          res.send(JSON.stringify(result));
      }
   })
});

app.get('/get-comments/:articleName', function (req, res) {
   // make a select request
   // return a response with the results
   let query = `SELECT comment.*, user.username FROM article, comment, user WHERE article.title = '${req.params.articleName}' AND article.id = comment.article_id AND comment.user_id = user.id ORDER BY comment.timestamp DESC`
   con.query(query, [], function (err, result) {
      if (err) {
          console.log(err)
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result));
      }
   });
});

app.post('/submit-comment/:articleName', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        con.query(`SELECT * from article where title = '${req.params.articleName}'`, function (err, result) {
            if (err) {
                console.log(err)
                res.status(500).send(err.toString());
            } else {
                if (result.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result[0].id;
                    // Now insert the right comment for this article
                    let query = `INSERT INTO comment (article_id, user_id ,comment, timestamp) VALUES (${articleId}, ${req.session.auth.userId}, '${req.body.comment}', now())`
                    con.query(query, function (err, result) {
                        if (err) {
                            console.log(err)
                            res.status(500).send(err.toString());
                        } else {
                            res.status(200).send('Comment inserted!')
                        }
                    });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});

var port = 4000;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
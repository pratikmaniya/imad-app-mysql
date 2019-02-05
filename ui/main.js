function loadLoginForm () {
    var loginHtml = `
          <center>
          <h4>Sign in</h4>
		  </center>
		  <p id="label">username</p>
		  <center>
		  <input class="form" type="text" name="userid" id="username">
		  </center>
		  <p id="label">Password</p>
		  <center>
		  <input class="form" type="password" name="password" id="password">
		  </center>
		  <br>
		  <center>
		  <input type="submit" class="signin" id="login_btn" value="sign in">
		  </center>
        `;
    document.getElementById('login_area').innerHTML = loginHtml;
    
    
    // Submit username/password to login
    var submit = document.getElementById('login_btn');
    submit.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  alert('signed in successfully!');
                  submit.value = 'Sucess!';
              } else if (request.status === 403) {
                  alert('Invalid credentials. Try again?');
              } else if (request.status === 500) {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              } else {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              }
              loadLogin();
          }  
          // Not done yet
        };
        
        // Make the request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        console.log(username);
        console.log(password);
        request.open('POST', '/login', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        submit.value = 'Logging in...';
    };
    
    var registerFH = document.getElementById('registerbtn');
    registerFH.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  alert('User created successfully');
                  registerFH.value = 'Registered!';
              } else {
                  alert('Could not register the user');
                  registerFH.value = 'Register';
              }
          }
        };
        
        // Make the request
        
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        
        console.log(username);
        console.log(password);
        request.open('POST', '/create-user-from-home', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        registerFH.value = 'Registering...';
    };
}

function loadLoggedInUser (username) {
    var loginArea = document.getElementById('login_area');
    loginArea.innerHTML = `
        <h3> Hi <i>${username}</i></h3>
        <a href="/logout">Logout</a>
    `;
    document.getElementById('registerbtn').type = "hidden";
}

function loadLogin () {
    // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                loadLoggedInUser(this.responseText);
            } else {
                loadLoginForm();
            }
        }
    };
    
    request.open('GET', '/check-login', true);
    request.send(null);
}

loadLogin();
 
var button = document.getElementById('counter');
button.onclick = function () {
    
    var request = new XMLHttpRequest();
    
        request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            // Take some action
            if (request.status === 200) {
                var counter = request.responseText;
                var span = document.getElementById('count');
                span.innerHTML = counter.toString();          
            }
        }  
    };
    request.open('GET', '/counter', true);
    request.send(null);
};

var submit = document.getElementById('submit_btn');
submit.onclick = function () {
var request = new XMLHttpRequest();
    // Capture the response and store it in a variable
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
      // Take some action
          if (request.status === 200) {
              // Capture a list of names and render it as a list
              var names = request.responseText;
              names = JSON.parse(names);
              var list = '';
              for (var i=0; i< names.length; i++) {
                  list += '<li>' + names[i] + '</li>';
              }
              var ul = document.getElementById('namelist');
              ul.innerHTML = list;   
          }
      }  
      // Not done yet
    };
    // Make the request
    var nameInput = document.getElementById('name'); 
    var name = nameInput.value;
    request.open('GET', '/submit-name?name=' + name, true);
    request.send(null);  
 }; 

function loadArticles () {
        // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            // console.log(this.responseText);
            var articles = document.getElementById('articles');
            if (request.status === 200) {
                var content = '<ul>';
                var articleData = JSON.parse(this.responseText);
                for (var i=0; i< articleData.length; i++) {
                    content += `<li>
                    <a href="/articles/${articleData[i].title}">${articleData[i].heading}</a>
                    (${articleData[i].date.split('T')[0]})</li>`;
                }
                content += "</ul>"
                articles.innerHTML = content;
            } else {
                articles.innerHTML('Oops! Could not load all articles!')
            }
        }
    };
    
    request.open('GET', '/get-articles', true);
    request.send(null);
}

loadArticles();
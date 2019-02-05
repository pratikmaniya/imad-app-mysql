function loadRegisterForm () {
    var registerHtml = `
          <h4>Sign up</h4>
		  <p>Your Name</p>
		  <center>
		  <input id="name" class="infield" type="text" name="name">
		  </center>
		  <p>Mobile Number</p>
		  <center>
		  <input type="text" class="infield" id="mnumber" name="mobilenumber" placeholder="10 digits only">
		  </center>
		  <p>Username</p>
		  <center>
		  <input type="text" name="hidden" class="infield"  value="" id ="nusername">
		  </center>
		  <p>Password</p>
		  <center>
		  <input type="password" class="infield" id="npassword" placeholder="At least 6 characters" autocomplete="new-password">
		  </center>
		  <br>
		  <center>
		  <input type="submit" id="register_btn" class="register" value="Register">
		  </center>
		  <br>
		  <h2>Already have an account?<a class ="backlink" href="./signin.html">Sign in</a></h2>
        `;
    document.getElementById('register_area').innerHTML = registerHtml;
    
    var register = document.getElementById('register_btn');
	register.onclick = function () {
            // Create a request object
            var request = new XMLHttpRequest();
        
            // Capture the response and store it in a variable
            request.onreadystatechange = function () {
                if (request.readyState === XMLHttpRequest.DONE) {
                    // Take some action
                    if (request.status === 200) {
                        alert('User created successfully');
                        register.value = 'Registered!';
                    } 
                    else {
                        alert('Could not register the user');
                        register.value = 'Register';
                    }
                }
            };
            
            // Make the request
                
            var name = document.getElementById('name').value;
            var mobile = document.getElementById('mnumber').value;
            var username = document.getElementById('nusername').value;
            var password = document.getElementById('npassword').value;
                
            console.log(name);
            console.log(mobile);
            console.log(username);
            console.log(password);
            request.open('POST', '/create-user', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify({name: name, mobile: mobile, username: username, password: password}));
            register.value = 'Registering...';
	}; 
}

loadRegisterForm();
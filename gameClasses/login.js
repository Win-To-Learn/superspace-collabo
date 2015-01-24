var login = {
	
	init: function() {
		var self = this;
		self.loginDiv = $("#login");
		
		self.elems = {
			'remember' : self.loginDiv.find("input[name=remember]"),
			'username' : self.loginDiv.find("input[name=username]"),
			'password' : self.loginDiv.find("input[name=password]"),
			'status' : self.loginDiv.find("div.loginStatus"),
		};
		if(typeof(Storage) !== "undefined") {
			var r = localStorage.getItem('remember');
			self.elems['remember'].prop('checked', r);
			if(r) {
				if(localStorage.getItem('username') !== null) {
					self.elems['username'].val(localStorage.getItem('username'));
				}
				if(localStorage.getItem('password') !== null) {
					self.elems['password'].val(localStorage.getItem('password'));
				}
			}
		}
		
		self.elems['remember'].on("change", function() {
			if(typeof(Storage) !== "undefined") {
				localStorage.setItem('remember', this.checked);
				if(this.checked) {
					localStorage.setItem('username', self.elems['username'].val());
					localStorage.setItem('password', self.elems['password'].val());
				}
				else {
					localStorage.removeItem('username');
					localStorage.removeItem('password');
				}
			}
		});
		
		self.loginDiv.on("click", "button", function() {
			switch($(this).attr("name")) {
				case "submit":
					var remember = self.elems['remember'].is(':checked');
					var username = self.elems['username'].val();
					var password = self.elems['password'].val();
					if(typeof(Storage) !== "undefined") {
						localStorage.setItem('remember', remember);
						if(remember) {
							localStorage.setItem('username', username);
							localStorage.setItem('password', password);
						}
						else {
							localStorage.removeItem('username');
							localStorage.removeItem('password');
						}
					}
					self.login(username, password)
					break;
			}
		})
	},

	showLogin: function() {
		$(".igeLoading").fadeOut(200);
		this.loginDiv.fadeIn(200);
	},
	
	login: function(username, password) {
		console.log("Logging in");
		ige.network.send("login", [username,password]);
	},
	
	loginDenied: function() {
		this.elems['status'].attr("data-status", "denied").html("Login denied, invalid password").fadeIn();
	},
	
	loginSuccessful: function() {
		this.elems['status'].attr("data-status", "successful").html("Login successful").fadeIn();
		this.loginDiv.fadeOut(600, function() {
			ige.emit('login');
		});
	}
};
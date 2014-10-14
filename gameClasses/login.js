var login = {
	
	init: function() {
		var self = this;
		self.loginDiv = $("#login")
		
		var elems = {
			'remember' : self.loginDiv.find("input[name=remember]"),
			'username' : self.loginDiv.find("input[name=username]"),
			'password' : self.loginDiv.find("input[name=password]"),
		};
		if(typeof(Storage) !== "undefined") {
			var r = localStorage.getItem('remember');
			elems['remember'].prop('checked', r);
			if(r) {
				if(localStorage.getItem('username') !== null) {
					elems['username'].val(localStorage.getItem('username'));
				}
				if(localStorage.getItem('password') !== null) {
					elems['password'].val(localStorage.getItem('password'));
				}
			}
		}
		
		elems['remember'].on("change", function() {
			if(typeof(Storage) !== "undefined") {
				localStorage.setItem('remember', this.checked);
			}
		});
		
		self.loginDiv.on("click", "button", function() {
			switch($(this).attr("name")) {
				case "submit":
					var remember = elems['remember'].is(':checked');
					var username = elems['username'].val();
					var password = elems['password'].val();
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
		ige.network.send("login");
	}
}
class User {
	
	constructor(name, email, password, stripeId = "") {
		this.data = new Object();
		this.data.name = name;
		this.data.email = email;
		this.data.password = password;
		this.data.stripeId = stripeId;
	}
	
	get json() {
		return this.data;
	}
	
};

module.exports = User;
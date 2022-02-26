/* global Module */

/* Magic Mirror
 * Module: MMM-OpenMensa
 *
 * By Till Michels (tillmii)
 * MIT Licensed.
 */

Module.register("MMM-OpenMensa", {
	defaults: {
		canteen: 79,
		hideCategories: ["Pasta", "Terrine", "Tagessuppe"],
		updateInterval: 5000,
		fadeDuration: 1000,
		dataInterval: 3600000, // seconds
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		Log.info("Starting module: " + this.name);

		let self = this;

		this.canteenName = null;
		this.canteenData = null;
		this.last_update = Date.now() //Fetch new data every dataInterval milliseconds
		this.shownMeal = 0; //Meal which is currently displayed

		//Flag for check if module is loaded
		this.loaded = false;

		this.update = false;

		this.getCanteenName();

		// Schedule update timer
		this.getData();
		setInterval(function() {
			self.refresh();
		}, this.config.updateInterval);
	},

	getData: function() {
		let self = this;

		let lookup_time = moment().add(5, 'hours').format('YYYY-MM-DD');
		
		self.getOpening(lookup_time);

		let urlApi = "https://openmensa.org/api/v2/canteens/" + self.config.canteen + "/days/" + lookup_time + "/meals";

		let dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					//self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
				} else {
					Log.error(self.name, "Could not load data.");
				}
			}
		};
		dataRequest.send();
	},

	getOpening: function(date) {
		let self = this;

		let urlApi = "https://openmensa.org/api/v2/canteens/" + self.config.canteen + "/days/" + date;
		
		let dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.closed = JSON.parse(this.response).closed
					self.update = true;
					Log.info(self.name, self.canteenName,"Mensa closed: " + self.closed)
				} else if (this.status === 401) {
					//self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
				} else {
					Log.error(self.name, "Could not load data.");
				}
			}
		};
		dataRequest.send();
	},

	refresh: function() {
		let self = this;

		if (self.last_update + self.config.dataInterval < Date.now()) {
			self.getData();
			self.last_update = Date.now()
			self.updateDom(self.config.fadeDuration)
		}
		else if(self.canteenData.length>1 && !self.closed) {
			self.updateDom(self.config.fadeDuration)
		}
		else if (self.update) {
			self.update = false;
			self.updateDom(self.config.fadeDuration)
		}
	},

	getDom: function() {
		let self = this;

		

		let wrapper = document.createElement("div");
		//wrapper.setAttribute("width", "300px")
		wrapper.appendChild(self.header());

		if (!self.closed && self.canteenData) {
			let data = document.createElement("div");

			let category = document.createElement("div");
			category.className = "category";
			category.innerHTML = self.canteenData[self.shownMeal]["category"];
			data.appendChild(category);
			let name = document.createElement("div");
			name.className = "name";
			name.innerHTML = self.canteenData[self.shownMeal]["name"];
			data.appendChild(name);

			let price = document.createElement("div");
			price.className = "price";
			price.innerHTML = self.canteenData[self.shownMeal]["prices"]["students"].toFixed(2).toString().replace(".", ",") + " €";
			data.appendChild(price);

			wrapper.appendChild(data);

			self.shownMeal = (self.shownMeal + 1) % self.canteenData.length;
		} 
		else if (self.closed) {
			let error = document.createElement("div");
			error.innerHTML = "Mensa closed."
			wrapper.appendChild(error);
		}
		else {
			let error = document.createElement("div");
			error.innerHTML = "There was an error fetching the data"
			wrapper.appendChild(error);
		}



		return wrapper;
	},

	header: function() {
		let self = this

		let header = document.createElement("header");
		header.innerHTML = self.canteenName;
		return header;
	},

	getCanteenName: function() {
		let self = this;

		let urlApi = "https://openmensa.org/api/v2/canteens/" + self.config.canteen;
		let dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.canteenName = JSON.parse(this.response)["name"];
				} else if (this.status === 401) {
					Log.error(self.name, this.status);
				} else {
					Log.error(self.name, "Could not load canteen name.");
				}
			}
		};
		dataRequest.send();
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-OpenMensa.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		let self = this;

		let canteenData = [];

		data.forEach(function (meal) {
			if(!self.config.hideCategories.includes(meal['category'])){
				canteenData.push(meal);
			}
		});

		self.canteenData = canteenData;
		self.update = true;
	},

	// socketNotificationReceived from helper
	/*socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-OpenMensa-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},*/
});

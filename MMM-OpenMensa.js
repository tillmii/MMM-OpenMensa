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
		fadeDuration: 2500
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		Log.info("Starting module: " + this.name);

		let self = this;

		this.canteenName = null;
		this.canteenData = null;
		this.today = moment().date(); //Fetch new data on a new day
		this.shownMeal = 0; //Meal which is currently displayed

		//Flag for check if module is loaded
		this.loaded = false;

		this.getCanteenName();

		// Schedule update timer
		this.getData();
		setInterval(function() {
			self.updateDom(self.config.fadeDuration);
		}, this.config.updateInterval);
	},

	getData: function() {
		let self = this;

		let urlApi = "https://openmensa.org/api/v2/canteens/" + self.config.canteen + "/days/" + moment().format("YYYY-MM-DD") + "/meals";

		let dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
				} else {
					Log.error(self.name, "Could not load data.");
				}
			}
		};
		dataRequest.send();
	},

	getDom: function() {
		let self = this;

		if (self.today !== moment().date()) {
			self.getData();
			self.today = moment().date();
		}

		let wrapper = document.createElement("div");
		//wrapper.setAttribute("width", "300px")
		wrapper.appendChild(self.header());

		if (self.canteenData) {
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
		} else {
			let error = document.createElement("div");
			error.innerHTML = "There was an error fetching the data"
			wrapper.appendChild(error);
		}



		return wrapper;
	},

	header: function() {
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

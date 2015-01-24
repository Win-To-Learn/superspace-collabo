window.igeLoader = (function () {
	var IgeLoader = function () {
		var self = this,
			ccScript;

		this._loadingCount = 0;
		this._loadingCountTemp = 0;
		this._loadingTotal = 0;
		this._loadLevel = 0;

		// Load the clientConfig.js file into browser memory
		ccScript = document.createElement('script');
		ccScript.src = igeRoot + 'CoreConfig.js';
		ccScript.onload = function () {
			self.coreConfigReady();
		};
		ccScript.addEventListener('error', function () {
			throw('ERROR LOADING ' + igeRoot + 'CoreConfig.js' + ' - does it exist?');
		}, true);

		document.getElementsByTagName('head')[0].appendChild(ccScript);
	};

	IgeLoader.prototype.coreConfigReady = function () {
		var self = this;

		if (typeof(igeCoreConfig) !== 'undefined') {
			// Load the client config
			ccScript = document.createElement('script');
			ccScript.src = './ClientConfig.js';
			ccScript.onload = function () {
				self.clientConfigReady();
			};
			ccScript.addEventListener('error', function () {
				throw('ERROR LOADING ClientConfig.js - does it exist?');
			}, true);

			document.getElementsByTagName('head')[0].appendChild(ccScript);
		} else {
			throw('ERROR READING igeCoreConfig object - was it specified in CoreConfig.js?');
		}
	};

	IgeLoader.prototype.clientConfigReady = function () {
		
		var self = this;
		// Add the two array items into a single array
		
		this._coreList = igeCoreConfig.include;
		this._clientList = igeClientConfig.include;

		this._fileList = [[],[],[],[],[],[],[],[],[],[],[]];
		for (i = 0; i < this._coreList.length; i++) {
			// Check that the file should be loaded on the client
			if (this._coreList[i][0].indexOf('c') > -1) {
				if(this._coreList[i][3] !== undefined) {
					this._fileList[this._coreList[i][3]].push(igeRoot + this._coreList[i][2]);
				}
				else {
					this._fileList[8].push(igeRoot + this._coreList[i][2]);
				}
				this._loadingCount++;
			}
		}

		for (i = 0; i < this._clientList.length; i++) {
			this._fileList[(i+1 == this._clientList.length ? 10 : 9)].push(this._clientList[i]);
			self._loadingCount++;
		}
		self._loadingTotal = self._loadingCount;
		//this.loadNext();
		//this.loadAll();
		this.loadNextLevel();
	};
	
	IgeLoader.prototype.loadNextLevel = function () {
		var fileList = this._fileList.shift(),
			scripts = [],
			self = this;
		
		if(fileList !== undefined) {
			for(var i in fileList) {
				var id = self._loadLevel+""+i,
					url = fileList[i];
				
				scripts[id] = document.createElement('script')
				scripts[id].src = url;
				
				scripts[id].addEventListener('error', function () {
					throw('ERROR LOADING ' + url + ' - does it exist?');
				}, true);
				
				scripts[id].onload = function () {
					self._loadingCount--;
					self._loadingCountTemp--;
					var elem = document.getElementById('loadingText');
					if(elem) { elem.textContent = 'Loading '+Math.round((self._loadingTotal-self._loadingCount)/self._loadingTotal*100)+"%"; }
				};
				
				self._loadingCountTemp++;
				//console.log(id+" Loading "+url);
				document.getElementsByTagName('head')[0].appendChild(scripts[id]);
			}
		
			var loadInterval = setInterval(function() {
				if(self._loadingCountTemp === 0) {
					//console.log("Level "+self._loadLevel+" loaded");
					clearInterval(loadInterval);
					self._loadLevel++;
					self.loadNextLevel();
				}
				//else { console.log("Waiting for level "+self._loadLevel+" to load..."); }
			}, 100);
			
		}
	};

	IgeLoader.prototype.loadAll = function (fileList) {
		var scripts = [],
			self = this;
		
		for(var i in this._fileList[level]) {
			scripts[i] = document.createElement('script')
			var url = this._fileList[i];
			if (url !== undefined) {
				scripts[i].src = url;
				
				scripts[i].addEventListener('error', function () {
					throw('ERROR LOADING ' + url + ' - does it exist?');
				}, true);
				
				scripts[i].addEventListener('load', function () {
					self._loadingCount--;
				}, true);
				
				self._loadingCount++;
				document.getElementsByTagName('head')[0].appendChild(scripts[i]);
			}
		}
	};
	
	IgeLoader.prototype.loadNext = function () {
		var url = this._fileList.shift(),
			script = document.createElement('script'),
			self = this;

		if (url !== undefined) {
			script.src = url;
			script.onload = function () {
				self.loadNext();
			};

			script.addEventListener('error', function () {
				throw('ERROR LOADING ' + url + ' - does it exist?');
			}, true);

			document.getElementsByTagName('head')[0].appendChild(script);
		}
	};

	return new IgeLoader();
}());
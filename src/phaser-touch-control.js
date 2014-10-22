/* global Phaser */
/**
  * Phaser Touch Control Plugin
  * It adds a movement control for mobile and tablets devices

	The MIT License (MIT)

	Copyright (c) 2014 Eugenio Fage

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

	Contact: https://github.com/eugenioclrc, @eugenioclrc

  */

(function(window, Phaser) {
	'use strict';
	/**
	  * TouchControl Plugin for Phaser
	  */
	Phaser.Plugin.TouchControl = function (game, parent) {
		/* Extend the plugin */
		Phaser.Plugin.call(this, game, parent);
		this.input = this.game.input;

		this.imageGroup = [];
	};

	//Extends the Phaser.Plugin template, setting up values we need
	Phaser.Plugin.TouchControl.prototype = Object.create(Phaser.Plugin.prototype);
	Phaser.Plugin.TouchControl.prototype.constructor = Phaser.Plugin.TouchControl;

	Phaser.Plugin.TouchControl.prototype.settings = {
		// max distance from itial touch
		maxDistanceInPixels: 200,
		singleDirection: false,
		numberOfSegments: 2
	};

	Phaser.Plugin.TouchControl.prototype.init = function(baseImage, touchImage, segmentImage) {
		if(Array.isArray(baseImage)) {
			this.imageGroup.push(this.game.add.image(0, 0, baseImage[0], baseImage[1]));
		} else if(typeof baseImage === 'string') {
			this.imageGroup.push(this.game.add.image(0, 0, baseImage));
		}

		if(this.settings.numberOfSegments > 0 && segmentImage) {
			for(var i = 0; i < this.settings.numberOfSegments; i++) {
				if(Array.isArray(segmentImage)) {
					this.imageGroup.push(this.game.add.image(0, 0, segmentImage[0], segmentImage[1]));
				} else if(typeof segmentImage === 'string') {
					this.imageGroup.push(this.game.add.image(0, 0, segmentImage));
				}
			}
		}

		if(Array.isArray(touchImage)) {
			this.imageGroup.push(this.game.add.image(0, 0, touchImage[0], touchImage[1]));
		} else if(typeof touchImage === 'string') {
			this.imageGroup.push(this.game.add.image(0, 0, touchImage));
		}

		this.imageGroup.forEach(function (e) {
			e.anchor.set(0.5);
			e.visible=false;
			e.fixedToCamera=true;
		});

	};

	Phaser.Plugin.TouchControl.prototype.cursors = {
		up: false, down: false, left: false, right: false
	};

	Phaser.Plugin.TouchControl.prototype.speed = {
		x:0, y:0
	};

	Phaser.Plugin.TouchControl.prototype.inputEnable = function() {
		this.input.onDown.add(createCompass, this);
		this.input.onUp.add(removeCompass, this);
	};

	Phaser.Plugin.TouchControl.prototype.inputDisable = function() {
		this.input.onDown.remove(createCompass, this);
		this.input.onUp.remove(removeCompass, this);
	};

	var initialPoint;
	var createCompass = function(){
		this.imageGroup.forEach(function (e) {
			e.visible=true;
			e.bringToTop();
			
			e.cameraOffset.x=this.input.worldX;
			e.cameraOffset.y=this.input.worldY;
			
		}, this);
		
		this.preUpdate=setDirection.bind(this);

		initialPoint=this.input.activePointer.position.clone();
		
	};
	var removeCompass = function () {
		this.imageGroup.forEach(function(e){
			e.visible = false;
		});

		this.cursors.up = false;
		this.cursors.down = false;
		this.cursors.left = false;
		this.cursors.right = false;
		
		this.speed.x = 0;
		this.speed.y = 0;
		
		this.preUpdate=empty;
	};
	
	var empty = function(){
	};

	var setDirection = function() {
		var d=initialPoint.distance(this.input.activePointer.position);
		var maxDistanceInPixels = this.settings.maxDistanceInPixels;

		var deltaX=this.input.activePointer.position.x-initialPoint.x;
		var deltaY=this.input.activePointer.position.y-initialPoint.y;

		if(this.settings.singleDirection){
			if(Math.abs(deltaX) > Math.abs(deltaY)){
				deltaY = 0;
				this.input.activePointer.position.y=initialPoint.y;
			}else{
				deltaX = 0;
				this.input.activePointer.position.x=initialPoint.x;
			}
		}
		var angle = initialPoint.angle(this.input.activePointer.position);
		
		
		if(d>maxDistanceInPixels){
			deltaX = Math.cos(angle) * maxDistanceInPixels;
			deltaY = Math.sin(angle) * maxDistanceInPixels;
		}

		this.speed.x = parseInt((deltaX/maxDistanceInPixels) * 100 * -1, 10);
		this.speed.y = parseInt((deltaY/maxDistanceInPixels)*100 * -1, 10);

		
		this.cursors.up = (deltaY < 0);
		this.cursors.down = (deltaY > 0);
		this.cursors.left = (deltaX < 0);
		this.cursors.right = (deltaX > 0);
		
		this.imageGroup.forEach(function(e,i){
			e.cameraOffset.x = initialPoint.x+(deltaX)*i/(this.imageGroup.length-1);
			e.cameraOffset.y = initialPoint.y+(deltaY)*i/(this.imageGroup.length-1);
		}, this);
		
	};
	Phaser.Plugin.TouchControl.prototype.preUpdate = empty;

	
}(window, Phaser));
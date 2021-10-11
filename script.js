

// setCookie()
// checkCookie();
// setCookie();

var aId = 'new';
var elm = document.getElementById(aId);
var elmStyle = document.getElementById('new').style;


function highlight() {
	elmStyle = 'background-color: rgba(127.5, 127.5, 127.5, 0.5);'
	document.getElementById(aId).style = elmStyle;
}




function galleryShow(linkID, imgSrc){
	mouseX = event.clientX;
	mouseY = event.clientY;
	console.log("Gallery is shown");
	xPos = mouseX + 100;
	yPos = mouseY + 10;
	document.getElementById("galleryDiv").style.left = xPos + "px";
	document.getElementById("galleryDiv").style.top = yPos + "px";
	document.getElementById("galleryDiv").style.display = "block";
	document.getElementById("galleryImg").src = "img/" + imgSrc;
	console.log("img/" + imgSrc);
}
function galleryHide(linkID){
	document.getElementById("galleryDiv").style.display = "none";
	console.log("Gallery is hidden");
}






function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var darkModeValue=getCookie("DarkMode");
  if (darkModeValue == "on") {
    localStorage.setItem("dark-mode", "on");
	}
  if(darkModeValue == "off") {
		localStorage.setItem("dark-mode", "off");
  }
}





/*
function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires+"; path=/";
}

function getCookie(cname) {
    var title = cname + "=";
    var cookie_array = document.cookie.split(';');
    for(var i=0; i<cookie_array.length; i++) {
        var check = cookie_array[i];
        while (check.charAt(0)==' ') check = check.substring(1);
        if (check.indexOf(title) != -1) {
            return check.substring(title.length, check.length);
        }
    }
    return "";
}

function checkCookie() {
    var name=getCookie("name");
    if (name != "") {
        alert("Welcome again " + name);
    } else {
       name = prompt("Please enter your name:","");
       if (name != null && name != "") {
           setCookie("name", name, 30);
       }
    }
}
*/

update();

function update() {
	if(darkModeValue == 'on'){
		console.log(alert("Dark Mode Is On"))
		update();
	}
	if(darkModeValue == 'off'){
		console.log(alert("Dark Mode Is Off"))
		update();
	}
}





/*
 * (c) Zane Harrison 2021
 * https://github.com/zanewesley/license
*/

var darkModeValue = "";

var darkModeManager = (function (mode) {

	'use strict';

	darkModeValue = "";

	var darkModeStyles = '.darkModeToggle { background-color: rgba(0, 0, 0, 0.2); border: none; border-radius: 1em; color: white; /*padding: 20px;*/ text-align: center; text-decoration: none; display: inline-block; font-size: 2em; position: fixed; z-index: 3; transition: all 1s; color: #1e1f26; fill: #1e1f26; cursor: pointer; width: 30px; height: 30px; } .darkModeToggle svg { width: 100%; height: 100%; position: absolute; left: 50%; transform: translate(-50%, -50%); } .dark .darkModeToggle { background-color: rgba(255, 255, 255, 0.2); color: #ccc; fill: #ccc; transform: rotate(180deg); }';
	var head = head = document.head || document.getElementsByTagName('head')[0];
	var styleElem = document.createElement('style');
	head.appendChild(styleElem);

	styleElem.type = 'text/css';
	if (styleElem.styleSheet){
		// This is required for IE8 and below.
		styleElem.styleSheet.cssText = darkModeStyles;
	} else {
		styleElem.appendChild(document.createTextNode(darkModeStyles));
}

	var darkModeToggle = document.createElement('div');
	darkModeToggle.classList.add('darkModeToggle');
	darkModeToggle.innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M8 256c0 136.966 111.033 248 248 248s248-111.034 248-248S392.966 8 256 8 8 119.033 8 256zm248 184V72c101.705 0 184 82.311 184 184 0 101.705-82.311 184-184 184z"></path></svg>';

	document.body.appendChild(darkModeToggle);

	darkModeToggle.querySelector('svg').style = 'width: 100%; height: 100%; position: fixed; left: 50%; transform: translate(-50%, -50%);';

		switch(mode) {
			case 'match':
				if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					localStorage.setItem("dark-mode", "on");
					document.body.classList.add('dark');
					darkModeValue = "on";
					setCookie("DarkMode", darkModeValue, 30);
					console.log("\nDarkMode Is On");
				} else {
					localStorage.setItem("dark-mode", "off");
					document.body.classList.remove('dark');
					darkModeValue = "off";
					setCookie("DarkMode", darkModeValue, 30);
					console.log("\nDarkMode Is Off");
				}
				break;
			case 'dark':
				localStorage.setItem("dark-mode", "on");
				document.body.classList.add('dark');
				darkModeValue = "on";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("\nDarkMode Is On");
				break;
			case 'light':
				localStorage.setItem("dark-mode", "off");
				document.body.classList.remove('dark');
				darkModeValue = "off";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("\nDarkMode Is Off");
				break;
			default:
				if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					localStorage.setItem("dark-mode", "on");
					document.body.classList.add('dark');
					darkModeValue = "on";
					setCookie("DarkMode", darkModeValue, 30);
					console.log("\nDarkMode Is On");
				} else {
					localStorage.setItem("dark-mode", "off");
					document.body.classList.remove('dark');
					darkModeValue = "off";
					setCookie("DarkMode", darkModeValue, 30);
					console.log("\nDarkMode Is Off");
				}
				break;
		}

	/*if(localStorage.getItem("dark-mode") == 'on') {
		document.body.classList.add('dark');
	}*/

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
	    var newColorScheme = e.matches ? "dark" : "light";
	    if(newColorScheme == "dark") {
	    	document.body.classList.add('dark');
				darkModeValue = "on";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("\nDarkMode Is On");
	    } else {
	    	document.body.classList.remove('dark');
				darkModeValue = "off";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("\nDarkMode Is Off");
	    }
	});

	document.querySelectorAll('.darkModeToggle').forEach(function(elem) {
		elem.addEventListener('click', function(e) {
			if(!document.body.classList.contains('dark')) {
				document.body.classList.add('dark');
				localStorage.setItem("dark-mode", "on");
				darkModeValue = "on";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("\nDarkMode Is On");
				document.getElementById('numberOfGames').style = " margin-top: -5px; color:#ffffff; text-shadow: #dbdbdb 0px 0px 10px,   #dbdbdb 0px 0px 10px,   #dbdbdb 0px 0px 5px,#dbdbdb 0px 0px 10px,   #dbdbdb 0px 0px 16px,   #dbdbdb 0px 0px 32px;   #000 0px 0px 16px,   #000 0px 0px 1px;";
			} else {
				document.body.classList.remove('dark');
				localStorage.setItem("dark-mode", "off");
				darkModeValue = "off";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("\nDarkMode Is Off");
				document.getElementById('numberOfGames').style = " margin-top: -5px; color:#101010; text-shadow: #8a8a8a 0px 0px 10px,   #8a8a8a 0px 0px 10px,   #8a8a8a 0px 0px 5px,#8a8a8a 0px 0px 10px,   #8a8a8a 0px 0px 16px,   #8a8a8a 0px 0px 32px;   #000 0px 0px 16px,   #000 0px 0px 1px;";
			}
		});
	});

	/* console.log('Dark mode toggle loaded');*/

})();

var headerDiv = document.getElementById('headerDiv')
headerDiv.width = outerWidth

var headss = document.getElementById('')







function alertNewLook() {
  var txt;
  if (confirm("Would you like to see the new version of SEMAG!?")) {
    txt = "You pressed OK!";
  } else {
    txt = "You pressed Cancel!";
  }
	return txt;
}




















































var myFunction = (function() {
  var privateVar = 'Hello';
  
  return function innerFunction() {
    return privateVar;
  };
})();

// console.log(myFunction());

var email;
var user;

function getInfo(){
	email = document.getElementById('email').value;
	user = document.getElementById('user').value;
}

function ifAccount(){
	if(email == "wallaceaja2@wsdstudent.net"){
		if(user == "chingchong100"){
			console.log("hello!")
			return email, user
		} else {
			console.log("NOPE")
		}
	}
} 


/*var account = (function h() {
	email = document.getElementById('email');
	user = document.getElementById('user');
	emailVal = document.getElementById('email').value;
	userVal = document.getElementById('user').value;
	console.log("emailVal: " + emailVal + " \n" + "userVal: " + userVal + "\n");
	info = [emailVal, userVal];
	return user, info;
})();
console.log(account());*/

function getNumGames() {
	var gameNum = document.getElementById('new').className;
	gameNum = document.getElementById('new').className;
	gameNum = gameNum.substring(1);
	console.log("Games: " + gameNum);
	document.getElementById('numberOfGames').innerHTML = gameNum + " Games!";
	
}

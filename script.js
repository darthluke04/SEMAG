//Console.re

console.re.log('remote log test');

// setCookie()
// checkCookie();
// setCookie();

var aId = 'new';
var elm = document.getElementById(aId);
var elmStyle = document.getElementById('new').style;

function jsMain(){
	getNumGames();
	popupLink('SUBSCRIBE To Karter Bishop!', 'Karters Channel', 'https://www.youtube.com/channel/UCFwKUpbU80mpVvWUI218JRQ');
// 	questionBtn('Would you like to vote on a game?', 'YES', 'NO'); openPopup();
}


function highlight() {
	elmStyle = 'background-color: rgba(127.5, 127.5, 127.5, 0.5);'
	document.getElementById(aId).style = elmStyle;
}

/* SIDE BAR SCRIPT.JS */

/*250px and add a black background color to body */
document.getElementById("mySidenavbtn").style.position = "fixed";

function openNav() {
  document.getElementById("mySidenav").style.width = "300px";
  document.getElementById("main").style.marginLeft = "100px";
  document.body.style.backgroundColor = "rgba(0,0,0,0.1)";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.body.style.backgroundColor = "white";
}


/* Alerts? */
function alerts() {
	alert("Do you want to recieve notifications Via Email?")
}


/* POPUP */
function openPopup(){ 
	document.getElementById("popup").className = "popupOpen";
	console.log("opened popup");
}

function closePopup(){
	document.getElementById("popup").className = "popup";
	console.log("closed popup");
}

function alert(title, desc) {
  	document.getElementById("title").innerHTML = title;
	document.getElementById("desc").innerHTML = desc;
}

function popupLink(title, desc, url) {
	document.getElementById("title").innerHTML = title;
	document.getElementById("desc").innerHTML = "<a href=" + url + " target='_blank'>" + desc + "</a>";
	openPopup();
	setTimeout(() => { closePopup(); }, 5000);
}

function voteBtn(question) {
	selectId = "gameVote";
	submitId = "submitBtn";
	defaultVal = "Please vote on a game";
	game1 = "Hextris v1";
	game2 = "Hextris v2";
	game3 = "Stack";
	game4 = "Chrome Dino Runner";
	game5 = "Colorsplosion";
	game6 = "Guess That Number";
	game7 = "2048 v1";
	game8 = "2048 v2";
	game9 = "Tic Tac Toe v1";
	game10 = "Tic Tac Toe v2";
	game11 = "Peace";
	game12 = "Color Swirl v1";
	game13 = "Tetris v1";
	game14 = "Tetris v2";
	game15 = "Defender";
	game16 = "Pacman v1";
	game17 = "Pacman v2";
	game18 = "Snake";
	game19 = "Space Invaders v1";
	game20 = "Space Invaders v2";
	game21 = "Tetris v3";
	game22 = "Multiplayer Snake v1";
	game23 = "XSSnake Online Multiplayer";
	game24 = "Tron";
	game25 = "Multiplayer Car Game v1";
	game26 = "Color Land 4";
	game27 = "Tank Game Online Multiplayer";
	game28 = "Quadplay v1";
	game29 = "Time Sphere";
	game30 = "Emulatrix";
	game31 = "Minecraft v1";
	game32 = "Bouncy Bacon";
	game33 = "Flappy Bird";
	game34 = "Boomshire";
	game35 = "Super Mario Brothers";
	game36 = "Plants Vs Zombies";
	game37 = "Classic Pool";
	game38 = "Filler";
	game39 = "The Oregon Trail";
	game40 = "Connect 4";
	game41 = "Dubm Ways To Die";
	game42 = "Color Swirl v2";
	game43 = "2048 v3";
	game44 = "Multiplayer Car Game v2";
	game45 = "Multiplayer Chess";
	game46 = "Car Drifting Simulator";
	game47 = "Quadplay v2";
  document.getElementById("title").innerHTML = question;

	// document.getElementById(selectId).value;

	document.getElementById("desc").innerHTML = "<select id=" + selectId + " value=" + defaultVal + "><option disabled value=" + defaultVal + ">" + defaultVal + "</option><option value=" + game1 + ">" + game1 + "</option><option value=" + game2 + ">" + game2 + "</option><option value=" + game3 + ">" + game3 + "</option><option value=" + game4 + ">" + game4 + "</option><option value=" + game5 + ">" + game5 + "</option><option value=" + game6 + ">" + game6 + "</option><option value=" + game7 + ">" + game7 + "</option><option value=" + game8 + ">" + game8 + "</option><option value=" + game9 + ">" + game9 + "</option><option value=" + game10 + ">" + game10 + "</option><option value=" + game11 + ">" + game11 + "</option><option value=" + game12 + ">" + game12 + "</option><option value=" + game13 + ">" + game13 + "</option><option value=" + game14 + ">" + game14 + "</option><option value=" + game15 + ">" + game15 + "</option><option value=" + game16 + ">" + game16 + "</option><option value=" + game17 + ">" + game17 + "</option><option value=" + game18 + ">" + game18 + "</option><option value=" + game19 + ">" + game19 + "</option><option value=" + game20 + ">" + game20 + "</option><option value=" + game21 + ">" + game21 + "</option><option value=" + game22 + ">" + game22 + "</option><option value=" + game23 + ">" + game23 + "</option><option value=" + game24 + ">" + game24 + "</option><option value=" + game25 + ">" + game25 + "</option><option value=" + game26 + ">" + game26 + "</option><option value=" + game27 + ">" + game27 + "</option><option value=" + game28 + ">" + game28 + "</option><option value=" + game29 + ">" + game29 + "</option><option value=" + game30 + ">" + game30 + "</option><option value=" + game31 + ">" + game31 + "</option><option value=" + game32 + ">" + game32 + "</option><option value=" + game33 + ">" + game33 + "</option><option value=" + game34 + ">" + game34 + "</option><option value=" + game35 + ">" + game35 + "</option><option value=" + game36 + ">" + game36 + "</option><option value=" + game37 + ">" + game37 + "</option><option value=" + game38 + ">" + game38 + "</option><option value=" + game39 + ">" + game39 + "</option><option value=" + game40 + ">" + game40 + "</option><option value=" + game41 + ">" + game41 + "</option><option value=" + game42 + ">" + game42 + "</option><option value=" + game43 + ">" + game43 + "</option><option value=" + game44 + ">" + game44 + "</option><option value=" + game45 + ">" + game45 + "</option><option value=" + game46 + ">" + game46 + "</option><option value=" + game47 + ">" + game47 + "</option></select>";
	openPopup();


// -->	document.getElementById(submitId).addEventListener("click", function() {
//    
// 	 //Retrieve data from text field
// 	-->	document.getElementById(submitId).value  = defaultVal;
// 	-->	closePopup();
//                 questionBtn("");
//                 openPopup();
//    
// -->	});

	// if(document.getElementById("gameVote").value != defaultVal) {
	// 	closePopup();
	// }
	// document.getElementById("desc").onmouseenter = closePopup();
}

/*function questionBtn(question, ansA, ansB) {
	game1 = "Hextris v1";
	game2 = "Hextris v2";
	game3 = "Stack";
	game4 = "Chrome Dino Runner";
	game5 = "Colorsplosion";
	game6 = "Guess That Number";
	game7 = "2048 v1";
	game8 = "2048 v2";
	game9 = "Tic Tac Toe v1";
	game10 = "Tic Tac Toe v2";
	game11 = "Peace";
	game12 = "Color Swirl v1";
	game13 = "Tetris v1";
	game14 = "Tetris v2";
	game15 = "Defender";
	game16 = "Pacman v1";
	game17 = "Pacman v2";
	game18 = "Snake";
	game19 = "Space Invaders v1";
	game20 = "Space Invaders v2";
	game21 = "Tetris v3";
	game22 = "Multiplayer Snake v1";
	game23 = "XSSnake Online Multiplayer";
	game24 = "Tron";
	game25 = "Multiplayer Car Game v1";
	game26 = "Color Land 4";
	game27 = "Tank Game Online Multiplayer";
	game28 = "Quadplay v1";
	game29 = "Time Sphere";
	game30 = "Emulatrix";
	game31 = "Minecraft v1";
	game32 = "Bouncy Bacon";
	game33 = "Flappy Bird";
	game34 = "Boomshire";
	game35 = "Super Mario Brothers";
	game36 = "Plants Vs Zombies";
	game37 = "Classic Pool";
	game38 = "Filler";
	game39 = "The Oregon Trail";
	game40 = "Connect 4";
	game41 = "Dubm Ways To Die";
	game42 = "Color Swirl v2";
	game43 = "2048 v3";
	game44 = "Multiplayer Car Game v2";
	game45 = "Multiplayer Chess";
	game46 = "Car Drifting Simulator";
	game47 = "Quadplay v2";
	onclick = "onclick='location.href='";
	link = "https://semag-website.nielsen101004.repl.co/signin.html'";
  	document.getElementById("title").innerHTML = question;
	document.getElementById("desc").innerHTML = "<input" + onclick + link + "type='button' id='questionButton1' name= class='questionButton1' value=" + ansA + "><input type='button' id='questionButton2' class='questionButton2' value=" + ansB + ">";
	if(document.getElementById(questionButton1).value == "YES"){
		
	}
// 	document.getElementById("desc").innerHTML = ansA + ansB;
}*/


/* Submit votes google sheets */ 
// const scriptURL = 'https://script.google.com/macros/s/AKfycby096L_SXnOOuwQxd1NbB-gA0D1hXzjG3Xe_EjMwOH-zJoo3WY/exec'
// const form = document.forms['submit-to-google-sheet']

// form.addEventListener('submit', e => {
// 	e.preventDefault()
// 	fetch(scriptURL, { method: 'POST', body: new FormData(form)})
// 	.then(response => console.log('Success!', response))
// 	.catch(error => console.error('Error!', error.message))
//   })


/* GALLERY */
function galleryShow(linkID, imgSrc){
	mouseX = event.clientX;
	mouseY = event.clientY;
	console.log("Gallery is shown");
	xPos = mouseX + 100;
	yPos = mouseY + 10;
	document.getElementById("galleryDiv").style.left = xPos + "px";
	document.getElementById("galleryDiv").style.top = yPos + "px";
	document.getElementById("galleryDiv").style.display = "block";
	document.getElementById("galleryDiv").innerHTML = '<img id="galleryImg" src="img/HextrisSc.png" style="width:100%"></img>'
	document.getElementById("galleryImg").src = "img/" + imgSrc;
	console.log("img/" + imgSrc);
}
function videoShow(linkID, imgSrc){
	mouseX = event.clientX;
	mouseY = event.clientY;
	console.log("Gallery is shown");
	xPos = mouseX + 100;
	yPos = mouseY + 10;
	document.getElementById("galleryDiv").style.left = xPos + "px";
	document.getElementById("galleryDiv").style.top = yPos + "px";
	document.getElementById("galleryDiv").style.display = "block";
	document.getElementById("galleryDiv").innerHTML = '<video id="galleryVid" src=""style="width:100%" controls autoplay muted></video>'
	document.getElementById("galleryVid").src = "vid/" + imgSrc;
	console.log("vid/" + imgSrc);
}
function galleryHide(linkID){
	document.getElementById("galleryDiv").style.display = "none";
	document.getElementById("galleryDiv").innerHTML = "";
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
  darkModeValue = getCookie("DarkMode");
  if (darkModeValue != "") {
    alert("" + darkModeValue);
  } else if(darkModeValue == "on"){
     if (darkModeValue != "" && darkModeValue != null) {
	     
	     setCookie("DarkMode", "on", 30);
   	}
  } else if(darkModeValue == "off") {
  	if (darkModeValue != "" && darkModeValue != null) {
		
		setCookie("DarkMode", "off", 30);
   	}
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

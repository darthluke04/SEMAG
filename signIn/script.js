<script>
        // Grab dom elements from html layout 
        var loginForm=document.getElementById("loginform-wrapper");
        var registerForm=document.getElementById("registerform");
        var loginBtn=document.getElementById("loginBtn");
        var registerBtn=document.getElementById("registerBtn");
        var forgot= document.getElementById("forgot-panel");

        //Registration button is clicked
        registerBtn.onclick=function() { 
            //Change css properties
            loginForm.style.left="-430px";
            loginForm.style.opacity="0";
            forgot.style.left = "-430px";
            forgot.style.opacity = '0';
            registerForm.style.left= "0px";
            registerForm.style.opacity="1";
            loginBtn.classList.remove("active");
            registerBtn.classList.add("active");               
            }
         //login button is clicked
        loginBtn.onclick=function() {
            //Change css propertie
            loginForm.style.left="0px";
            loginForm.style.opacity="1";
            forgot.style.left = "0px";
            forgot.style.opacity = '1';
            registerForm.style.left = "430px";
            registerForm.style.opacity = "0";
            loginBtn.classList.add("active");
            registerBtn.classList.remove("active");    

        }

    </script>








setCookie()
checkCookie();
setCookie();



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
					console.log("DarkMode Is On");
				} else {
					localStorage.setItem("dark-mode", "off");
					document.body.classList.remove('dark');
					darkModeValue = "off";
					setCookie("DarkMode", darkModeValue, 30);
					console.log("DarkMode Is Off");
				}
				break;
			case 'dark':
				localStorage.setItem("dark-mode", "on");
				document.body.classList.add('dark');
				darkModeValue = "on";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("DarkMode Is On");
				break;
			case 'light':
				localStorage.setItem("dark-mode", "off");
				document.body.classList.remove('dark');
				darkModeValue = "off";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("DarkMode Is Off");
				break;
			default:
				if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					localStorage.setItem("dark-mode", "on");
					document.body.classList.add('dark');
					darkModeValue = "on";
					setCookie("DarkMode", darkModeValue, 30);
					console.log("DarkMode Is On");
				} else {
					localStorage.setItem("dark-mode", "off");
					document.body.classList.remove('dark');
					darkModeValue = "off";
					setCookie("DarkMode", darkModeValue, 30);
					console.log("DarkMode Is Off");
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
				console.log("DarkMode Is On");
	    } else {
	    	document.body.classList.remove('dark');
				darkModeValue = "off";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("DarkMode Is Off");
	    }
	});

	document.querySelectorAll('.darkModeToggle').forEach(function(elem) {
		elem.addEventListener('click', function(e) {
			if(!document.body.classList.contains('dark')) {
				document.body.classList.add('dark');
				localStorage.setItem("dark-mode", "on");
				darkModeValue = "on";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("DarkMode Is On");
			} else {
				document.body.classList.remove('dark');
				localStorage.setItem("dark-mode", "off");
				darkModeValue = "off";
				setCookie("DarkMode", darkModeValue, 30);
				console.log("DarkMode Is Off");
			}
		});
	});

	console.log('Dark mode toggle loaded');

})();

var headerDiv = document.getElementById('headerDiv')
headerDiv.width = outerWidth

var headss = document.getElementById('')
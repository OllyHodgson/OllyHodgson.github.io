/* ********************

This is called every time:
- the page is loaded
- the user hits the back/forward buttons
- the user follows a link where <a rel="history">

******************** */

function callback(hash)
{
	var currentTab;
	
	if(hash) {
		currentTab = hash;
		setCurrentTab(hash);
		$("html, body").animate({ scrollTop: 0 }, "fast");
		if ($(currentTab + ":visible").length < 1) {
			$(".content:not(" + currentTab + ")").slideUp("fast", function () {
				$(currentTab).slideDown("fast");
			});		
		} else {
			$(".content:not(" + currentTab + ")").slideUp("fast");
		} 
	} else {
		setCurrentTab("#who");
		if ($("#who:visible").length < 1) {
			$(".content:not(#who)").slideUp("fast", function () {
				$("#who").slideDown("fast");
			});	
		} else {
			$(".content:not(#who)").slideUp("fast");
		}	
	}
}

function setCurrentTab (tabid) {
	$("#nav a").removeClass("current");
	$("#nav").find("a[href='" + tabid + "']").addClass("current");
} 

/* ********************

The onload function.

******************** */

$(document).ready(function(){

	callback(window.location.hash);

	jQuery("#nav a").click(function(event) {
		var newHref = event.target.href.substring(event.target.href.indexOf('#'));;
		event.preventDefault();
		if (newHref !== window.location.hash) {
			window.location.hash = newHref;
		}
	});

	jQuery(window).hashchange(function(event) {
		callback(window.location.hash);
	});
	
	if (window.location.hash) {
		setTimeout(function() {
		    window.scrollTo(0, 0);
  		}, 1);
	}

});

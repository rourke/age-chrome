$(function() {
	
	/* ========================== */
	/* === DEFINING VARIABLES === */
	/* ========================== */
	
	var title = document.title;
	var part = 0;
	
	if(title.indexOf("Part 1") != -1){ part = 1; }
	else if(title.indexOf("Part 2") != -1){ part = 2; }
	else if(title.indexOf("Part 3") != -1){ part = 3; }
	else if(title.indexOf("Part 4") != -1){ part = 4; }
	else if(title.indexOf("Part 5") != -1){ part = 5; }
	else if(title.indexOf("9.2.0 Update") != -1){ part = 6; }
	else if(title.indexOf("Region Changing") != -1){ part = 7; }
	else if(title.indexOf("Hardmod Downgrade") != -1){ part = 8; } // See below: Reset steps
	
	// guidePage = Used to decide if this is actually part 1-5 of the guide
	var guidePage = (part > 0 ? true : false);
	
	var partURLs = [];
	partURLs[1] = 'https://github.com/Plailect/Guide/wiki/Part-1-(Homebrew)';
	partURLs[2] = 'https://github.com/Plailect/Guide/wiki/Part-2-(Downgrading)';
	partURLs[3] = 'https://github.com/Plailect/Guide/wiki/Part-3-(RedNAND)';
	partURLs[4] = 'https://github.com/Plailect/Guide/wiki/Part-4-(Getting-the-OTP)';
	partURLs[5] = 'https://github.com/Plailect/Guide/wiki/Part-5-(arm9loaderhax)';
	
	/* ======================= */
	/* === COOKIE HANDLING === */
	/* ======================= */
	
	var cookieData = readCookie('age-data');
	var dataArray, options;
	// Cookie does not exist
	if(cookieData == null){
		cookieData = {};
		if(guidePage){
			cookieData[part] = [];
			dataArray = [];
		}
		cookieData['options'] = {
			'sticky-menu': true,
			'keyboard-shortcuts': true,
			'index': true
		};
		options = cookieData['options'];
	}
	// Cookie exists
	else{
		cookieData = JSON.parse(cookieData);
		
		// Load options
		options = cookieData['options'];
		
		if(guidePage){
			// Cookie does exist, but no part data
			if(!(part in cookieData)){
				cookieData[part] = [];
				dataArray = [];
			}
			// There is a cookie and part data, assign dataArray
			else{
				dataArray = cookieData[part];
			}
		}
	}
	
	/* ================================= */
	/* === ON PAGE LOAD MANIPULATION === */
	/* ================================= */
	
	// Sticky menu
	$('#wiki-rightbar div.gollum-markdown-content').attr('id', 'age-sticky').before('<div id="age-sticky-anchor"></div>');
	
	// Indexing headers
	var headers = $('#wiki-body div.markdown-body > h2, #wiki-body div.markdown-body > h3, #wiki-body div.markdown-body > h4, #wiki-body div.markdown-body > h5');
	if(headers.length > 0){
		// Header(s) found, build html
		$('#age-sticky div.wiki-custom-sidebar').append('<div id="age-index">Index:<br><ul></ul></div>');
		for(i = 0; i < headers.length; i++){
			var header = headers[i];
			var title = $(header).text().trim();
			var url = $('a', header).first().attr('href');
			var type = $(header).prop("tagName").toLowerCase();
			
			$('#age-index ul').append('<li class="age-header-indent-' + type + '">&bull; <a href="' + url + '">' + title + '</a></li>');
		}
		setIndex();
	}
	
	if(guidePage){
		
		// Class to identify a guide page, for styling
		$('#wiki-body').addClass('guide-page');
		
		// Check/Uncheck all links in every header
		var ols = $('#wiki-body .markdown-body > ol');
		for(i = 0; i < ols.length; i++){
			var imgCheckAllURL = chrome.extension.getURL("images/check-all.png");
			var imgUncheckAllURL = chrome.extension.getURL("images/uncheck-all.png");
			$(ols[i]).prevAll("h4, h5").first().append(' <span class="age-header"><img src="' + imgCheckAllURL + '" height="16" width="16"> <a href="#" class="age-btn-check-all">Check all</a> <img src="' + imgUncheckAllURL + '" height="16" width="16"> <a href="#" class="age-btn-uncheck-all">Uncheck all</a></span>');
		}
		
		// Add an ID to every list item
		var lis = $('#wiki-body .markdown-body > ol > li')
		for(i = 0; i < lis.length; i++){
			$(lis[i]).attr('data-age-id', "" + (i+1)).attr('id', 'age-li-' + (i+1));
		}
		
		// Check all list items that are stored in the cookie
		for(i = 0; i < dataArray.length; i++){
			$('#age-li-' + dataArray[i]).addClass('age-checked');
		}
	}
	
	$('#age-sticky div.wiki-custom-sidebar').append('<p id="age-menu-options"></p>')
	
	// Continue Guide anchor
	var lastPart = 0, lastStep = 0;
	for(i=5; i >= 1; i--){
		if(i in cookieData){
			if(cookieData[i].length > 0){
				var lastPart = i;
				var lastStep = cookieData[i][cookieData[i].length - 1];
				break;
			}
		}
	}
	if(lastPart != 0 && lastStep != 0){
		$('#age-menu-options').append('<a href="' + partURLs[lastPart] + '#age-li-' + lastStep + '" id="age-btn-continue">Continue guide</a><br>');
	}
	var hash = window.location.hash;
	if(hash) {
		if(hash.indexOf('age-li') != -1){
			$('html, body').scrollTop($(hash).offset().top);
		}
	}
	
	// Options anchor
	$('#age-menu-options').append('<a href="#" id="age-btn-options-open">AGE Options</a><br>');
	
	// Options modal
	$('body').append('<div id="age-options-overlay"></div><div id="age-options"><div id="age-options-content">Options</div><a href="#" id="age-btn-options-close">close</a></div>');
	
	
	
	/* ============================ */
	/* === HANDLERS & LISTENERS === */
	/* ============================ */
	
	// Button: open option modal
	$('#age-btn-options-open').on('click', function(e){
		openOptions();
		e.preventDefault();
	});
	// Button/overlay click: close option modal
	$('#age-btn-options-close, #age-options-overlay').on('click', function(e){
		closeOptions();
		e.preventDefault();
	});
	
	// On option change
	$('#age-options').on('change', 'input', function(e){
		var option = $(this).attr('name');
		var state = $(this).is(':checked');
		
		options[option] = state;
		storeData();
		
		if(option == 'sticky-menu'){
			setStickyMenu();
		}
		else if(option == 'index'){
			setIndex();
		}
	});
	
	// Reset steps
	$('#age-options').on('click', '#age-btn-reset-steps', function(e){
		
		for(i=8; i > 0; i--){
			delete cookieData[i];
		}
		
		var dataToWrite = JSON.stringify(cookieData);
		createCookie('age-data', dataToWrite, 365);
		
		location.reload();
		e.preventDefault();
	})
	
	// Delete cookie
	$('#age-options').on('click', '#age-btn-delete-cookie', function(e){
		
		$('#age-options input').prop('checked', true).trigger('change');
		$('#wiki-body .markdown-body > ol > li').removeClass('age-checked');
		
		eraseCookie('age-data');
		
		location.reload();
		e.preventDefault();
	})
	
	// Scroll listener
	$(window).scroll(function(){
		if(options['sticky-menu']){
			stickyRelocate(); // sticky menu
		}
		optionsRelocate(); // options modal
	});
	
	// Window resize listener
	$(window).resize(function(){
		if(options['sticky-menu']){
			stickyRelocate();
		}
		optionsRelocate();
	})
	
	// Keyboard shortcuts
	$(document).on('keyup', function(e){
		if(options['keyboard-shortcuts']){
			// 1-5 keys
			if(e.which >= 49 && e.which <= 53){
				var goToPart = e.which - 48;
				location.href = partURLs[goToPart];
			}
			else if(e.which >= 97 && e.which <= 102){
				var goToPart = e.which - 96;
				location.href = partURLs[goToPart];
			}
			// left arrow key = previous
			else if(e.which == 37 && part > 1){
				if(guidePage){
					var goToPart = part - 1;
					location.href = partURLs[goToPart];
				}
			}
			// right arrow key = next
			else if(e.which == 39 && part < 5){
				if(guidePage){
					var goToPart = part + 1;
					location.href = partURLs[goToPart];
				}
			}
		}
	})
	
	if(guidePage){
		// List item click
		$('#wiki-body .markdown-body > ol > li').on("click", function(e){
			var ageId = parseInt($(this).attr('data-age-id'));
			if($(this).hasClass('age-checked')){
				$(this).removeClass('age-checked');
				storeData();
			}
			else{
				$(this).addClass("age-checked"); // .prevAll("li").addClass("age-checked")
				storeData();
			}
		});
		
		// Check all click
		$('#wiki-body a.age-btn-check-all').on('click', function(e){
			var ol = $(this).parents('h4, h5').nextAll('ol').first().find('li').addClass('age-checked');
			storeData();
			e.preventDefault();
		})
		
		// Uncheck all click
		$('#wiki-body a.age-btn-uncheck-all').on('click', function(e){
			var ol = $(this).parents('h4, h5').nextAll('ol').first().find('li').removeClass('age-checked');
			storeData();
			e.preventDefault();
		})
	}
	
	
	
	/* ================= */
	/* === FUNCTIONS === */
	/* ================= */
	
	// Index show/hide option change
	function setIndex(){
		if(options['index']){
			$('#age-index').show();
		}
		else{
			$('#age-index').hide();
		}
	}
	
	// Storing data in cookie
	function storeData(){
		if(guidePage){
			var lis = $('#wiki-body .markdown-body > ol > li.age-checked');
			var dataArray = [];
			for(i = 0; i < lis.length; i++){
				var ageId = $(lis[i]).attr('data-age-id');
				dataArray.push(ageId);
			}
			cookieData[part] = dataArray;
		}
		var dataToWrite = JSON.stringify(cookieData);
		createCookie('age-data', dataToWrite, 365);
	}
	
	// Create cookie function
	function createCookie(name, value, days) {
		var expires;

		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();
		} else {
			expires = "";
		}
		document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/Plailect/Guide/wiki/";
	}

	// Read cookie function
	function readCookie(name) {
		var nameEQ = encodeURIComponent(name) + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
		}
		return null;
	}

	// Delete cookie function
	function eraseCookie(name) {
		createCookie(name, "", -1);
	}
	
	/* =================== */
	/* === STICKY MENU === */
	/* =================== */

	// Relocatie sticky menu
	function stickyRelocate() {
		var window_top = $(window).scrollTop() + 10;
		var div_top = $('#age-sticky-anchor').offset().top;
		if (window_top > div_top) {
			$('#age-sticky.stick .wiki-custom-sidebar').css('max-height', ($( window ).height()-20) + 'px');
			$('#age-sticky').addClass('stick');
			$('#age-sticky-anchor').height($('#age-sticky').outerHeight());
		} else {
			$('#age-sticky').removeClass('stick');
			$('#age-sticky-anchor').height(0);
		}
	}
	
	// Sticky menu option change
	function setStickyMenu(){
		if(options['sticky-menu']){
			stickyRelocate();
		}
		else{
			$('#age-sticky').removeClass('stick');
			$('#age-sticky-anchor').height(0);
		}
	}
	
	if(options['sticky-menu']){
		stickyRelocate();
	}
	
	/* ===================== */
	/* === OPTIONS MODAL === */
	/* ===================== */
	
	// Set the position of the modal to center
	function optionsRelocate(){
		var options = $('#age-options'), overlay = $('#age-options-overlay'), top, left;
		if(overlay.css('display') != 'none'){
			top = Math.max($(window).height() - options.outerHeight(), 0) / 2;
			left = Math.max($(window).width() - options.outerWidth(), 0) / 2;
			
			options.css({
				top:top + $(window).scrollTop(), 
				left:left + $(window).scrollLeft()
			});
		}
	}
	
	// Load the options.html into the page
	var optionsURL = chrome.extension.getURL("options.html");
	$.get(optionsURL, function(data){
		$('#age-options-content').html(data);
		if(options['sticky-menu']){
			$('#age-options-sticky-menu').prop('checked', true);
		}
		if(options['keyboard-shortcuts']){
			$('#age-options-keyboard-shortcuts').prop('checked', true);
		}
		if(options['index']){
			$('#age-options-index').prop('checked', true);
		}
	});
	
	// Open options
	function openOptions(){
		$('#age-options-overlay, #age-options').show();
		/*$('html').addClass('stop-scrolling');*/
		optionsRelocate();
	}
	
	// Close options
	function closeOptions(){
		$('#age-options-overlay, #age-options').hide();
		/*$('html').removeClass('stop-scrolling');*/
	}

});
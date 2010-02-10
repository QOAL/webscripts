var cDay, cMonth, cYear; //Current displayed calendar page
var sDay = -1, sMonth, sYear; //Selected page on calendar
var cObject, cRefObj; //Calendar container, Object that called the current calendar

function calendar(date) {
/* Based on: http://scripts.franciscocharrua.com/calendar.php */
	if (date == null) { date = new Date(); }

	day = date.getDate();
	month = date.getMonth();
	year = date.getFullYear();
	cDay = day; cMonth = month; cYear = year;

	months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');

	last_month = new Date(year, month - 1, 1);
	this_month = new Date(year, month, 1);
	next_month = new Date(year, month + 1, 1);

	first_week_day = this_month.getDay() - 1;
	if (first_week_day == -1) { first_week_day = 6; }

	days_in_this_month = Math.round((next_month.getTime() - this_month.getTime()) / (1000 * 60 * 60 * 24));
	days_in_last_month = Math.round((this_month.getTime() - last_month.getTime()) / (1000 * 60 * 60 * 24));

	calendar_html = '<a title="' + months[(month + 11) % 12] + '" onclick="changeMonth(-1, this);"><div class="calmonthchange"><</div></a><div class="calmonth" onclick="hideCalendar();" title="Hide calendar">' + months[month] + ' ' + year + '</div><a title="' + months[(month + 1) % 12] + '" onclick="changeMonth(1, this);"><div class="calmonthchange">></div></a>';
	calendar_html += '<div class="calday">Mon</div><div class="calday">Tue</div><div class="calday">Wed</div><div class="calday">Thu</div><div class="calday">Fri</div><div class="calday">Sat</div><div class="calday">Sun</div>';
	 
	var i = 0;
	for (week_day = 0; week_day < first_week_day; week_day++) {
		i++;
		calendar_html += '<div class="calnodate">' + (days_in_last_month - first_week_day + i) + '</div>';
	}

	week_day = first_week_day;
	for (day_counter = 1; day_counter <= days_in_this_month; day_counter++) {
		week_day %= 7;
		if (sDay == day_counter && sMonth == cMonth && sYear == cYear) {
			calendar_html += '<a onclick="setSelectedDay(' + day_counter + ', this)"><div class="calseldate">' + day_counter + '</div></a>';
		} else {
			calendar_html += '<a onclick="setSelectedDay(' + day_counter + ', this)"><div class="caldate">' + day_counter + '</div></a>';
		}
		week_day++;
	}

	for (nextday = 1; nextday <= (7 - week_day); nextday++) {
		calendar_html += '<div class="calnodate">' + nextday + '</div>';
	}

	return calendar_html;
}

function changeMonth(amount, object) {
	cMonth = cMonth + amount;
	if (cMonth > 12) {
		cMonth -= 12;
		cYear++;
	} else if (cMonth < 1) {
		cMonth += 12;
		cYear--;
	}
	object.parentNode.innerHTML = calendar(new Date(cYear, cMonth, cDay));
}

function setSelectedDay(day, object) {
	sDay = day;
	sMonth = cMonth;
	sYear = cYear;
	object.firstChild.className = 'calseldate';
	cObject.style.visibility = "hidden";
	cObject.innerHTML = '';
	if (cRefObj.innerHTML) {
		cRefObj.innerHTML = sDay + '/' + (sMonth + 1) + '/' + sYear;
	} else {
		cRefObj.value = sDay + '/' + (sMonth + 1) + '/' + sYear;
	}
	validateInputDate(cRefObj);
}

function hideCalendar() {
	if (cObject != null) {
		cObject.style.visibility = "hidden";
		cObject.innerHTML = '';
		sDay = -1;
		cObject = null;
	}
}

function showCalendar(object, calendarObj) {
	if (cObject != null) {
		cObject.style.visibility = "hidden";
		cObject.innerHTML = '';
		sDay = -1;
	}
	cRefObj = object;
	if (cRefObj.innerHTML) {
		var dateStr = cRefObj.innerHTML;
	} else {
		var dateStr = cRefObj.value;
	}
	if (!isValidDate(dateStr)) {
		tmpDate = new Date();
	} else {
		var tmpDate = dateStr.split("/");
		sDay = tmpDate[0];
		sMonth = tmpDate[1] - 1;
		sYear = tmpDate[2];
		tmpDate = new Date(tmpDate[2], tmpDate[1] - 1, tmpDate[0]);
	}
	cObject = document.getElementById(calendarObj);
	cObject.style.left = cRefObj.offsetLeft + 5 + "px";
	cObject.style.top = cRefObj.offsetTop + 5 + "px";
	cObject.innerHTML = calendar(tmpDate);
	cObject.style.visibility = "visible";
}

function daysInMonth(month, year) { /* http://snippets.dzone.com/posts/show/2099 */
	return 32 - new Date(year, month, 32).getDate();
}

function isValidDate(str) {
	var valid = true;
	if (str.search(/\//i) == -1) {
		valid = false;
	}
	var tmpDate = str.split("/");
	if (valid == true && (isNaN(tmpDate[0]) || isNaN(tmpDate[1]) || isNaN(tmpDate[2]))) {
		valid = false;
	}
	if (valid == true && (tmpDate[0] < 1 || tmpDate[1] < 1 || tmpDate[2] < 1 ||
		tmpDate[0] > daysInMonth(tmpDate[1] - 1, tmpDate[2]) || tmpDate[1] > 12 || tmpDate[2] > 9999)) {
		valid = false;
	}
	return valid;
}

function validateInputDate(object) {
	if (cRefObj.innerHTML) {
		var dateStr = object.innerHTML;
	} else {
		var dateStr = object.value;
	}
	if (isValidDate(dateStr)) {
		object.className = object.className.replace(" invalidDate", "");
	} else {
		if (object.className.search(/\binvalidDate/i) == -1) {
			object.className = object.className + " invalidDate";
		}
	}
}
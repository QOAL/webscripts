This read me assumes you're quite competent when it comes to all this.

How to insert Qonsole into a web page:
	Head:
		<link rel="stylesheet" type="text/css" href="qonsole.css" />
		<script type="text/javascript" src="qonsole.js"></script>
	Body:
		<div id="qframe" class="qframe">
			<div id="qonsole" class="qonsole"><big><b>Qonsole</b></big><br />&bull; Need <a href="#q:help">help</a>?<br /></div>
			<div class="qinput"><b>&raquo;</b> <input type="text" id="qinput"></div>
		</div>

If you would like the qonsole to initialise on page load then add the following to the body tag:
	onload="qonsoleInit();"

You should be good to go now!

To change the amount of output history the Qonsole keeps, edit var maxLines = 20; in qonsole.js to taste.

The following will list the current default commands and expected output.
I doubt you'll really care about any of these since you'll probably want site specific functions (or just to pipe ajax responses into the qonsole). ;)

Default client side commands:
	Hide			Hides the Qonsole
	Show			Shows the Qonsole
	Clear / CLS		Clear the Qonsoles output
	Echo / Print / Say	Output the following to the Qonsole (pretty pointless)
	Url / Uri / Site / >	Goto to this address
	JS: / Javascript:	Excute the following Javascript

Default server side commands: (PHP Script)
	Help			Display a list of help; Please complete this output to suit your own needs.
	About			Prints a simple about message.
	Hello/Hi/Hey		Another pointless response.
	Time/Date		Returns the current date/time in the format: D jS M y, g:i a T (Change the scripts timezone at the top of it.)
	Goto/Go			Lame demo to show navigating a specific site while also passing any other perameters.

If you do not use PHP for your server side scripting then I'll have to leave it up to you to create the server script.

I guess that's it, have a good old poke about and I hope this helps.


http://qoal.110mb.com/qonsole/

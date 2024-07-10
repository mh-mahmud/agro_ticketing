For Deploy
-----------
.htaccess
<ifModule mod_rewrite.c>
	RewriteEngine On
	RewriteBase /ticket
	RewriteRule ^ticket/index\.html$ - [L]
	RewriteCond %{REQUEST_FILENAME} !-f
	RewriteCond %{REQUEST_FILENAME} !-d
	RewriteRule . /ticket/index.html [L]
</ifModule>

------------------------------------------------------

Add this line to package.json
"homepage": "http://192.168.11.221/ticket/"

------------------------------------------------------

Change API_URL, ROUTE_BASENAME to Config.js

------------------------------------------------------

Change logout path to component/common/Master.js

------------------------------------------------------

Change redirectToDashboard path in view/login/LoginView.js

------------------------------------------------------
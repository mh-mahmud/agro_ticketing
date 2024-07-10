<?php
return [
    'APP_BASE_URL'            => 'http://192.168.21.231/ticket',
    'ROW_PER_PAGE'            => 30,
    'MAX_REPORT_DAYS'         => 31,
    'TICKET_PHOTO_MAX_WIDTH'  => 500,
    'TICKET_PHOTO_MAX_HEIGHT' => 500,
    'ALLOW_MIME_TYPE'         => [
        'image/png', 'image/jpeg', /* docx */'application/vnd.openxmlformats-officedocument.wordprocessingml.document', /* doc */'application/msword', 'application/pdf'
    ],
    'MAIL'                    => [
        'HOST'      => 'smtp.gmail.com',
        'USERNAME'  => 'sagor@genusys.us',
        'PASSWORD'  => '********',
        'PORT'      => 587,
        'FROM'      => 'ticket@genusys.us'
    ],
    ['MEDIA_URL'              => "/usr/local/apache2/htdocs/ticketApi/"]
];

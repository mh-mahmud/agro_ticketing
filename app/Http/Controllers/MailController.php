<?php

namespace App\Http\Controllers;

use HTML5;
use Illuminate\Http\Request;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
use PhpParser\Node\Expr\Cast\Array_;

class MailController extends Controller {

    private $from   = [];
    private $to;
    private $subject;
    private $body;

    public function __construct(Array $to, $subject, $body, Array $from){
        $this->to       = $to;
        $this->subject  = $subject;
        $this->body     = $body;
        $this->from     = $from;
    }

    // =============== [ Email ] ===================
    public function email() {
        return view("mail");
    }

    // ========== [ Compose Email ] ================
    public function send() {
        require base_path("vendor/autoload.php");
        $mail = new PHPMailer(true);     // Passing `true` enables exceptions

        try {

            // Email server settings
            /* $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            ); */
            $mail->isSMTP();
            $mail->SMTPDebug    = 0;
            $mail->SMTPSecure   = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Host         = config('others.MAIL.HOST');// smtp host
            $mail->SMTPAuth     = true;
            $mail->Username     = config('others.MAIL.USERNAME');// sender username
            $mail->Password     = config('others.MAIL.PASSWORD');// sender password
            // $mail->SMTPSecure = 'tls';// encryption - ssl/tls
            $mail->Port         = config('others.MAIL.PORT');// port - 587/465

            $mail->setFrom($this->from['address'], $this->from['head']);
            foreach($this->to as $to){
                $mail->addAddress($to);
            }
            // $mail->addCC($request->emailCc);
            // $mail->addBCC($request->emailBcc);

            /* $mail->addReplyTo($this->reply['address'], $this->reply['head']); */

            /* Attachments */
            /* if(isset($_FILES['emailAttachments'])) {
                for ($i=0; $i < count($_FILES['emailAttachments']['tmp_name']); $i++) {
                    $mail->addAttachment($_FILES['emailAttachments']['tmp_name'][$i], $_FILES['emailAttachments']['name'][$i]);
                }
            } */

            $mail->isHTML(true);// Set email content format to HTML

            $mail->Subject = $this->subject;
            $mail->Body    = $this->body;
            $mail->send();
            /* if( !$mail->send() ) {
                return back()->with("failed", "Email not sent.")->withErrors($mail->ErrorInfo);
            }
            
            else {
                return back()->with("success", "Email has been sent.");
            } */

        } catch (Exception $e) {
             return back()->with('error','Message could not be sent.');
        }
    }
}
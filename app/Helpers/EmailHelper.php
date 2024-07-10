<?php

namespace App\Helpers;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

class EmailHelper
{
    public static function sendEmail($to, $subject, $message)
    {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'mail.urmigroup.net';
            $mail->SMTPAuth = true;
            $mail->Username = 'agrosal.ticket';
            $mail->Password = '$#!^bRT!ckE8506&!';
            $mail->SMTPSecure = 'ssl';
            $mail->Port = 465;
            // Sender and recipient information
            $mail->setFrom('agrosal.ticket@urmigroup.net', 'Agrosal-Ticket');
            // $mail->addAddress($to, 'Recipient Name'); // Replace with the recipient's email and name
            foreach ($to as $key => $email) {
                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $mail->addAddress($email, $email);
                } else {
                    return 'Invalid email addres: ' . $email;
                }
            }
            // Email content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $message;
            // Send the email
            if ($mail->send()) {
                return true; // Email sent successfully
            } else {
                return $mail->ErrorInfo; // Return the error message on failure
            }
        } catch (\Exception $e) {
            return $e->getMessage(); // Return the exception message on failure
        }
    }

}



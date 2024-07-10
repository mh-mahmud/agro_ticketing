<?php

namespace App\Http\Controllers;
class TicketingSystemAPI{

    private const BASE_URL_BACKEND              = 'http://localhost/ificTicket/public/api/';
    private const BASE_URL_FRONTEND             = 'http://localhost:3000/ticket/';
    private const CUSTOMER_DETAILS_MOBILE_EMAIL = 'http://localhost/test2.php?mobile=<TICKET_MOBLIE>';
    private const CUSTOMER_DETAILS_BY_CID       = 'http://localhost/test3.php?cid=<TICKET_CID>';
    private const CARD_DETAILS_BY_CID           = 'http://localhost/cardInfoById.php?cid=<TICKET_CID>';
    private const USERNAME                      = 'crm_api_user';
    private const PASSWORD                      = 1234;

    public function getTicketListByMobile($requestUrl, Array $data){
            
        $headers = array(
            "Content-Type: application/json",
            "Connection: keep-alive",
            "username: " . self::USERNAME,
            "password: " . self::PASSWORD
        );

        $data['requestTimestamp'] = time();
        $url 	= self::BASE_URL_BACKEND . $requestUrl . '?' . http_build_query($data);
        $result = $this->curlRequest($headers, $url, "GET");
        return json_encode($result['data']);

    }

    public function getTicketReplyIframe($ticket_id){

        $token = $this->getAuthToken();
        if($token){
            $iframe['iframe'] = '<iframe width="100%" height="800" style="border:1px solid black;" src="' . self::BASE_URL_FRONTEND . 'crm/crm-ticket-reply/' . $ticket_id . '/' . $token . '" title="Ticket Details"></iframe>';
        }else{
            $iframe['iframe'] = "Invalid Request !";
        }
        return json_encode([$iframe]);

    }

    
    public function getAgentInfo(){

		/* session_start();
		include_once('../ccpro/conf.php');
		return 'AGENT_ID:' . (isset($_SESSION[$db->db_suffix.'sesGCCUser']) ? $_SESSION[$db->db_suffix.'sesGCCUser'] : "_") . ':' . (isset($_SESSION[$db->db_suffix.'sesGCCUserFullName']) ? $_SESSION[$db->db_suffix.'sesGCCUserFullName'] : "_"); */
        
    }

    public function getTicketCreateIframe($cli=''){

        $token = $this->getAuthToken();
        if($token){
            $iframe['iframe'] = '<iframe width="100%" height="800" style="border:1px solid black;" src="' . self::BASE_URL_FRONTEND . 'crm/crm-create-ticket/' . $token . '/' . $cli . '" title="Create Ticket"></iframe>';
        }else{
            $iframe['iframe'] = "Invalid Request !";
        }
        return json_encode([$iframe]);

    }

    public function getAuthToken(){
        $url 	= self::BASE_URL_BACKEND . 'crm/get-auth-token';
        $headers = array(
            "Content-Type: application/json",
            "Connection: keep-alive",
            "username: " . self::USERNAME,
            "password: " . self::PASSWORD
        );
        $authData = $this->curlRequest($headers, $url, "GET");
        return $authData ?: null;
    }

    public function storeCustomerInfo($mobile){
        $customer_info = $this->curlRequest([], str_replace('<TICKET_MOBLIE>', $mobile, SELF::CUSTOMER_DETAILS_MOBILE_EMAIL), "GET");
        $data = [];
        if(
            is_array($customer_info) && 
            array_key_exists('gcode', $customer_info[0]) &&
            (array_key_exists('Code', $customer_info[0]) && (int)$customer_info[0]['Code'] == 0)
        ){
            $data['first_name']	= $customer_info[0]['CustomerName1'];
            $data['email']		= $customer_info[0]['Email1'];
            $data['mobile']		= $mobile;
            $data['requestTimestamp'] = time();
            $headers = array(
                "Connection: keep-alive",
                "username: " . self::USERNAME,
                "password: " . self::PASSWORD
            );
            $result       = $customer_info[0];
            $custmrIdKeys = array_flip(preg_grep("/CustomerID[0-9]*/", array_keys($result)));
            $final        = [];
            array_walk($custmrIdKeys, function($item, $key)use($result, &$final, $custmrIdKeys){
                $final[]  = $result[$key];
            });
            /* If user not exist then create otherwise return user info */
            return ["user_info"=>$this->curlRequest($headers, self::BASE_URL_BACKEND . 'crm/createUser', "POST", $data), "customer_ids"=>$final];
        }else{
            // Non registered customer
            $data['first_name']	= 'n/a';
            $data['mobile']		= $mobile;
            $data['requestTimestamp'] = time();
            $headers = array(
                "Connection: keep-alive",
                "username: " . self::USERNAME,
                "password: " . self::PASSWORD
            );
            return ["user_info"=>$this->curlRequest($headers, self::BASE_URL_BACKEND . 'crm/createUser', "POST", $data), "customer_ids"=>[]];
        }
        
    }

    public function getAccountInfoByCid($customerId){
        $customer_info = $this->curlRequest([], str_replace('<TICKET_CID>', $customerId, SELF::CUSTOMER_DETAILS_BY_CID), "GET");
        if( 
            is_array($customer_info) && 
            array_key_exists('gcode', $customer_info[0])
        ){

            if( array_key_exists('CustomerEnquiryByCustomerIDDetail', $customer_info[0]) ){
                $result       = $customer_info[0]['CustomerEnquiryByCustomerIDDetail'];
                $accounts     = array_flip(preg_grep("/Account[0-9]*/", array_keys($result)));
                $final        = [];
                array_walk($accounts, function($item, $key)use($result, &$final, $accounts){
                    if( (!empty($result[$key]) && !is_array($result[$key])) || (is_array($result[$key]) && count($result[$key])) ){
                        $final[]  = $result[$key];
                    }
                });
            }
            return $final;

        }
    }

    public function getCardInfoByCid($customerId){
        $card_info = $this->curlRequest([], str_replace('<TICKET_CID>', $customerId, SELF::CARD_DETAILS_BY_CID), "GET");
        
        if(
            is_array($card_info) && 
            array_key_exists('gcode', $card_info[0])
        ){

            if( $card_info[0]['gcode'] == 200 && array_key_exists('responseData', $card_info[0]) ){
                return array_column( $card_info[0]['responseData'], 'value' );
            }
            return [];

        }
    }

    private function curlRequest($headers, $url, $method, Array $data=null) {

        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLINFO_HEADER_OUT, true);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_TIMEOUT, 60);
        // curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        // curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

        if($data){
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        }

        $response = curl_exec($curl);

        if($data = $this->xmlToArray($response)){
            $result = $data;
        }elseif($data = $this->jsonToArray($response)){
            $result = $data;
        }else{
            $result = $response;
        }

        if(curl_errno($curl)){
            // throw the an Exception.
            throw new Exception(curl_error($curl));
        }
        curl_close($curl);
        return $result;

    }

    public function jsonToArray($string) {
        $r = json_decode($string, 1);
        if(json_last_error() === JSON_ERROR_NONE){// No error
        return $r;
        }
        return false;
    }

    public function xmlToArray($xml){
        
        $xml = @simplexml_load_string($xml, "SimpleXMLElement", LIBXML_NOCDATA);
        if($array = $this->jsonToArray( json_encode($xml), TRUE )){
            return $array;
        }
        return false;
        
    }

}
<?php


namespace App\Helpers;
use Str;

use Auth;
use Intervention\Image\Facades\Image as Image;
use App\Models\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class Helper
{
    public static function idGenarator()
    {
        return (time() + rand(1000, 9000)) . (rand(1000,9000) + rand(1000,9000));
    }

    public static function slugify($value)
    {

        return strtolower(preg_replace("/[^a-zA-Z0-9]+/", "-", $value));

    }

    public static function slugifyFullName($first_name,$middle_name='',$last_name){
        return strtolower(preg_replace("/[^a-zA-Z0-9]+/", "-", $first_name.' '.$middle_name.' '.$last_name));
    }

    public static function base64AvatarImageStore($url, $image)
    {
        if (!file_exists(public_path($url))) {
            mkdir(public_path($url), 777, true);
        }
        $filename = date('Ymdhis')."-".strtolower(preg_replace("/[^a-zA-Z0-9.]+/", "-", $image->getClientOriginalName()));
        Image::make($image->getRealPath())->save($url.$filename);
        return url($url.$filename);
    }

    public static function base64MediaUpload($url, $image)
    {
        $fileName = uniqid().'.'.$image->getClientOriginalExtension();
        $dir = "media/".$url."/";

        if (!file_exists(public_path ($dir))) {

            mkdir(public_path ($dir), 0755, true);

        }

        $image = Image::make($image);

        // Maximum width
        if( $image->width() > config('others.TICKET_PHOTO_MAX_WIDTH') ){

            $image = $image->resize(config('others.TICKET_PHOTO_MAX_WIDTH'), null, function ($constraint) {

                $constraint->aspectRatio();

            });

        }

        // Maximum height
        if( $image->height() > config('others.TICKET_PHOTO_MAX_HEIGHT') ){

            $image = $image->resize(null, config('others.TICKET_PHOTO_MAX_HEIGHT'), function ($constraint) {

                $constraint->aspectRatio();

            });

        }

        $image->save(public_path($dir. $fileName ));

        return url('/') . '/' . $dir . $fileName;
    }

    public static function fileUpload($url, $file)
    {
        $fileName = time().'_'.strtolower(preg_replace("/[^a-zA-Z0-9.]+/", "_", $file->getClientOriginalName()));

        $dir = config('others.MEDIA_URL').$url;

        if (!file_exists($dir)) {

            mkdir($dir, 0755, true);

        }

        $file->move($dir, $fileName);

        return url('/').'/'.$url . $fileName;

    }

    public static function getClientIp() {
        $ipaddress = '';
        if (isset($_SERVER['HTTP_CLIENT_IP']))
            $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
        else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        else if(isset($_SERVER['HTTP_X_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
        else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
        else if(isset($_SERVER['HTTP_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_FORWARDED'];
        else if(isset($_SERVER['REMOTE_ADDR']))
            $ipaddress = $_SERVER['REMOTE_ADDR'];
        else
            $ipaddress = 'UNKNOWN';
        return $ipaddress;
    }

    public static function storeLog(Array $data){
        if( isset($data['action']) && isset($data['operated_table']) ){
            return Log::create([
                'id'                => static::idGenarator(),
                'ip'                => static::getClientIp(),
                'user_agent'        => $_SERVER['HTTP_USER_AGENT'] ?? '',
                'action'            => $data['action'],
                'operated_table'    => $data['operated_table'] ?? null,
                'operated_row_id'   => $data['operated_row_id'] ?? null,
                'user_id'           => Auth::user()->id,
                'previous_data'     => $data['previous_data'] ?? null,
                'note'              => $data['note'] ?? null,
                'created_at'        => Carbon::now()->timestamp
            ]);
        }
        return false;
    }

    /**
     * If date is valid then return ture otherwise false
     * @return Bool
     */
    public static function isDateValid($date, $format){

        $validator = Validator::make(['date' => $date], ['date' => "date|date_format:{$format}"]);
        return !$validator->fails();

    }

    public static function isDateRangeValid($startDate, $endDate):bool{
        if(strtotime($startDate) > strtotime($endDate)){// Start date is after end date
            return false;
        }
        $startDate  = Carbon::parse($startDate);
        $endDate    = Carbon::parse($endDate);
        return config('others.MAX_REPORT_DAYS') >= $startDate->diffInDays($endDate);
    }

}

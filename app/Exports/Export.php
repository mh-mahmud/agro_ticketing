<?php
namespace App\Exports;

use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;

class Export implements FromCollection
{
    public $data;

    public function __construct(Array $data){
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data);
    }
}
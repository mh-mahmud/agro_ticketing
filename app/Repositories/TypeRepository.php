<?php


namespace App\Repositories;


use App\Http\Traits\QueryTrait;
use App\Models\Type;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class TypeRepository
{
    use QueryTrait;

    public function listing($request)
    {
        $query = (new Type())->where('parent_id', 0);

        if ($request->filled('query')){

            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);

        }
        
        if(isset($request->page) && $request->page == "*"){
            // Return All Data
            return $query->get();
        }

        return $query->paginate(config('others.ROW_PER_PAGE'));

    }

    public function getAllTypes($request)
    {
        $query = (new Type());

        if ($request->filled('query')){

            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);

        }
        
        if(isset($request->page) && $request->page == "*"){
            // Return All Data
            return $query->get();
        }

        return $query->paginate(config('others.ROW_PER_PAGE'));

    }

    public function show($id)
    {
        if (!empty($id)){
            return Type::findorfail($id);
        }else{
            return Type::orderBy('created_at','DESC')->take(1)->get();
        }

    }

    public function create(array $data)
    {
        $dataObj                = new Type();
        $dataObj->parent_id     = $data['category'] ?? 0;
        $dataObj->name          = $data['name'];
        $dataObj->slug          = $data['slug'];
        $dataObj->description   = $data['description'];
        $dataObj->day           = $data['day'] ?: 0;
        $dataObj->hour          = $data['hour'] ?: 0;
        $dataObj->min           = $data['min'] ?: 0;
        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        $dataObj->save();
        return $dataObj->id;
    }

    public function update(array $data, $id)
    {
        if ($dataObj = Type::where('id', $id)->first()) {
    
            $dataObj->parent_id     = $data['category'] ?? $dataObj->parent_id;
            $dataObj->name          = $data['name'];
            $dataObj->slug          = $data['slug'];
            $dataObj->description   = $data['description'];
            $dataObj->day           = $data['day'] ?: 0;
            $dataObj->hour          = $data['hour'] ?: 0;
            $dataObj->min           = $data['min'] ?: 0;
            $dataObj->updated_at    = Carbon::now()->timestamp;
            return $dataObj->save();
    
        } else {
            throw new Exception("Not found!");
        }
    }

    public function delete($id)
    {
        return Type::find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }
}
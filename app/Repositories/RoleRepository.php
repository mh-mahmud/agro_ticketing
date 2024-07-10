<?php


namespace App\Repositories;
use App\Http\Traits\QueryTrait;


use App\Models\Role;
use Carbon\Carbon;

class RoleRepository
{
    use QueryTrait;
    protected $userRepository;

    public function __construct(UserRepository $userRepository)
    {

        $this->userRepository       = $userRepository;

    }
    
    // public function listing($request)
    // {
    //     if(isset($request->page) && $request->page == "*"){
    //         return Role::with('permissions')
    //             ->get();
    //     }
    //     return Role::with('permissions')
    //         ->orderBy('created_at','DESC')
    //         ->paginate(config('others.ROW_PER_PAGE'));

    // }

    public function listing($request)
    {
    
        $query = Role::with('permissions');
        if(! in_array(1, auth()->user()->roles()->get()->pluck('id')->toArray())){
            $query = $query->where('id', '!=', 1);
        }

        if(isset($request->page) && $request->page == "*"){
            return $query->get();
        }

        elseif ($request->filled('query')){
            //$query = Role::with('permissions');
            
            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
            return $query/*->with('permissions')*/->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));
        }else{

            return $query->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));

        }

    }

    public function show($id)
    {

        return Role::with('permissions','users')->findOrFail($id);

    }

    public function showMultiple($ids)
    {
        
        return Role::with('permissions','users')->whereIn('id', $ids)->get();

    }

    public function create(array  $data)
    {

        $role          = new Role;
        $role->name    = $data['name'];
        $role->slug    = isset($data['slug']) ? $data['slug'] : $role->slug;
        $role->details = isset($data['details']) ? $data['details'] : $role->details;
        $role->status  = isset($data['status']) ? $data['status'] : $role->status;
        $role->created_at    = Carbon::now()->timestamp;
        $role->updated_at    = Carbon::now()->timestamp;
        $role->save();
        return $role;
        
    }

    public function update(array $data, $id)
    {
        
        $role          = Role::with('permissions','users')->findorfail($id);
        $role->name    = $data['name'];
        $role->slug    = isset($data['slug']) ? $data['slug'] : $role->slug;
        $role->details = isset($data['details']) ? $data['details'] : $role->details;
        $role->status  = isset($data['status']) ? $data['status'] : $role->status;
        //as well as all users status will be changed
        if (count($role->users) > 0){
            foreach ($role->users as $aUser){
                $this->userRepository->changeItemStatus($data, $aUser->id);
            }
        }
        $role->updated_at    = Carbon::now()->timestamp;
        $role->save();
        return $role;
    }

    public function delete($id)
    {

        $role                       = Role::with('permissions','users')->findorfail($id);
        return $role->delete();
    }

    public function changeItemStatus(array $data, $id)
    {

        $role                       = Role::with('permissions','users')->findorfail($id);
        $role->status               = $data['status'];
        //as well as all users status will be changed
        if (count($role->users) > 0){
            foreach ($role->users as $aUser){
                $this->userRepository->changeItemStatus($data, $aUser->id);
            }
        }
        $role->save();
        return $role;
    }

    public function checkRoleName(array $data)
    {

        $role                       = Role::where('name',$data['name'])->get();
        return $role;
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }
}

<?php


namespace App\Repositories;
use App\Http\Traits\QueryTrait;


use App\Models\Group;
use Carbon\Carbon;
use DB;


class GroupRepository
{
    use QueryTrait;

    public function __construct()
    {

    }

    public function getAll($select){
        return Group::select($select)->get();
    }

    // public function listing($request)
    // {

    //     if($request->page == "*"){
    //         return Group::with('users')
    //             ->get();
    //     }
    //     return Group::with('users')
    //         ->orderBy('created_at','DESC')
    //         ->paginate(2);

    // }

    public function listing($request)
    {
        $with = [
            'users','users.userDetails','parentRecursive','tickets.notifications'
        ];

        if(isset($request->page) && $request->page == "*"){
            return Group::with($with)
                ->get();
        }elseif ($request->filled('query')){
            $query = Group::with('users','users.userDetails');
            $likeFilterList = ['name'];
            $whereFilterList = ['name'];
            $query = self::filterTask($request,$query,$whereFilterList,$likeFilterList);
            return $query->with($with)->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));
        }else{

            return Group::with($with)->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));

        }

    }

    public function show($id)
    {

        // return Role::with('permissions','users')->findOrFail($id);

    }

    public function create(array  $data)
    {

        $group                      = new Group;
        $group->name                = $data['name'];
        $group->description         = isset($data['description']) ? $data['description'] : null;
        $group->slug                = $data['slug'];
        $group->parent_id           = $data['parent_id'];
        $group->need_ticket_approval= (string)($data['need_ticket_approval'] ?? 0);
        $group->created_at          = Carbon::now()->timestamp;
        $group->updated_at          = Carbon::now()->timestamp;
        $group->save();
        return $group;
        
    }

    public function update(array $data, $id)
    {
        
        $group                      = Group::with('users','parentRecursive')->findorfail($id);
        $group->name                = $data['name'];
        $group->description         = isset($data['description']) ? $data['description'] : $group->description;
        $group->slug                = isset($data['slug']) ? $data['slug'] : $group->slug;
        $group->parent_id           = $data['parent_id'];
        $group->need_ticket_approval= (string)($data['need_ticket_approval'] ?? $group->need_ticket_approval);
        $group->updated_at          = Carbon::now()->timestamp;
        $group->save();
        return $group;

    }

    public function delete($id)
    {

        $group                  = Group::findorfail($id);
        $group->delete();
        DB::table('groups_agents')->where('group_id', $id)->delete();
        return true; 

    }

    public function getAgentByGroup($id)
    {
        return Group::with('users','users.userDetails')
            ->where('id', $id)
            ->first();
    }
    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;

    }

    public function getTicketAssignedGroup($ticketId){
        if($data = DB::table('ticket_forwards')->where('ticket_id', $ticketId)->latest()->first()){
            return DB::table('groups')->find($data->group_id);
        }

        // If no forward
        return DB::table('groups')->find(DB::table('tickets')->find($ticketId)->group_id);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();
        
        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        
        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $users = $query->get();
        
        return response()->json([
            'data' => $users
        ]);
    }
    
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:100',
            'license_number' => 'nullable|string|max:50',
            'license_expiry' => 'nullable|date',
            'truck_id' => 'nullable|exists:trucks,id',
            'role' => 'required|in:admin,manager,driver,customer',
            'status' => 'nullable|in:active,inactive,on_leave',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $data['password'] = bcrypt($data['password']);

        $user = User::create($data);

        
        return response()->json([
            'data' => $user
        ], 201);
    }
    
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $user
        ]);
    }
    
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:100',
            'license_number' => 'nullable|string|max:50',
            'license_expiry' => 'nullable|date',
            'truck_id' => 'nullable|exists:trucks,id',
            'role' => 'sometimes|in:admin,manager,driver,customer',
            'status' => 'nullable|in:active,inactive,on_leave',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        
        return response()->json([
            'data' => $user
        ]);
    }
    
    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        
        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}

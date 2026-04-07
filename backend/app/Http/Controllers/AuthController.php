<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Register
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:student,teacher'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user
        ]);
    }

    // Login
    public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    if (!Auth::attempt($credentials)) {
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    $user = Auth::user();

    // Role check
    if ($user->role === 'student') {
        $roleMessage = 'Welcome Student';
    } elseif ($user->role === 'teacher') {
        $roleMessage = 'Welcome Teacher';
    } else {
        $roleMessage = 'Unknown Role';
    }

    return response()->json([
        'message' => 'Login successful',
        'role_message' => $roleMessage,
        'user' => $user
    ]);
}
}
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    private function departmentOptions(): array
    {
        return [
            'CSE',
            'EEE',
            'BBA',
        ];
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'department' => $user->department,
            'session' => $user->session,
            'address' => $user->address,
            'status' => $user->status,
            'profile_photo_url' => $user->profile_photo
                ? url(Storage::url($user->profile_photo))
                : null,
        ];
    }

    // Register
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'role' => 'required|in:student,teacher',
            'department' => [
                Rule::requiredIf($request->role === 'student'),
                'nullable',
                'string',
                Rule::in($this->departmentOptions()),
            ],
        ]);

        // Create user with hashed password
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'department' => $request->department,
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $this->formatUser($user),
        ]);
    }

    // Login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Create token (Sanctum)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    // Authenticated user profile
    public function profile(Request $request)
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
            'departments' => $this->departmentOptions(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:1000',
            'profile_photo' => 'nullable|image|max:2048',
        ]);

        $payload = [
            'phone' => $request->phone,
            'address' => $request->address,
        ];

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            $payload['profile_photo'] = $request
                ->file('profile_photo')
                ->store('profile-photos', 'public');
        }

        $user->update($payload);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $this->formatUser($user->fresh()),
            'departments' => $this->departmentOptions(),
        ]);
    }
}

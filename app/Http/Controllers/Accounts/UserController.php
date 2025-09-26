<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function userRegister(Request $request) {
        $validator = Validator::make($request->all(), [
            "name" => "required",
            "email" => "required|unique:users,email",
            "cp_number" => "required",
            "password" => "required|string|min:8",
        ]);

        if($validator->fails()) {
            return response()->json([
                "errors" => $validator->errors(),
                "status" => "Failed",
            ], 422);
        }

        $validated = $validator->validated();

        try {
            User::create([
                "name" => $validated['name'],
                'email' => $validated['email'],
                'cp_number' => $validated['cp_number'],
                'password' => $validated['password'],
            ]);

            return response()->json([
                "Message" => "User registered successfully",
                "Status" => "Success",
            ], 201);

        } catch(\Exception $e) {
            return response()->json([
                "Message" => $e->getMessage(),
                "Status" => "Failed",
            ], 404);
        }
    }

    public function userLogin(Request $request) {
        $validator = Validator::make($request->all(), [
            'email' => "required",
            "password" => "required",
        ]);

        if($validator->fails()) {
            return response()->json([
                "Message" => $validator->errors(),
                "Status" => "Failed",
            ], 404);
        }

        $validated = $validator->validated();

        try {
            if(Auth::guard("user")->attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
                $user = Auth::guard('user')->user();
                $token = $user->createToken('user')->plainTextToken;

                return response()->json([
                    'token' => $token,
                    'role' => 'user',
                    "user" => $user,
                ]);
            }

            return response()->json([
                'Message' => 'Login Failed! Check your Credentials!',
                'Status' => "Failed!",
            ], 404);

        } catch(\Exception $e) {
            return response()->json([
                'Message' => $e->getMessage(),
                'Status' => 'Failed',
            ], 404);
        }
    }

    public function userLogout(Request $request) {
        if(Auth::guard('web')->check()) {
            $request->user()->tokens()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Logged out successfully',
            ]);
        } elseif (Auth::guard('user')->check()) {
            $user = Auth::guard('user')->user();
            $user->tokens()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Logged out successfully',
            ]);
        }
    }
}

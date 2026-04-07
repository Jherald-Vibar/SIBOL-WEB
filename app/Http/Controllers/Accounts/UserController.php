<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Socialite;

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
            ], 422);
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

            if(Auth::guard('web')->attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
                $user = Auth::guard('web')->user();
                $token = $user->createToken('admin')->plainTextToken;

                return response()->json([
                    'token' => $token,
                    'role' => 'admin',
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

    public function changePassword(Request $request) {

        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        if(!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Your current password is incorrect.'
            ], 400);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully.'
        ], 200);
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


    public function redirect() {
      $httpClient = new Client(['verify' => false]);
      return Socialite::driver('google')
          ->setHttpClient($httpClient)
          ->stateless()
          ->redirect();
    }

    public function googleAuth() {
        try {
            $httpClient = new Client(['verify' => false]);
            $google_user = Socialite::driver('google')
                ->setHttpClient($httpClient)
                ->stateless()
                ->user();

            $user = User::where('email', $google_user->getEmail())->first();

            if ($user) {
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $google_user->getId(),
                    ]);
                }
            } else {
                $user = User::create([
                    'name' => $google_user->getName(),
                    'email' => $google_user->getEmail(),
                    'google_id' => $google_user->getId(),
                    'image' => $google_user->getAvatar(),
                    'password'  => \Illuminate\Support\Facades\Hash::make(uniqid()),
                ]);
            }

            $token = $user->createToken('user')->plainTextToken;

            return redirect(
                "http://localhost:5173/auth/callback?" . http_build_query([
                    'token' => $token,
                    'role'  => 'user',
                    'name'  => $user->name,
                    'email' => $user->email,
                    'image' => $user->image,
                    'google_id' => $user->google_id,
                ])
            );

        } catch (\Throwable $e) {
            return redirect("http://localhost:5173/guest/login?error=" . urlencode($e->getMessage()));

        }
    }
}

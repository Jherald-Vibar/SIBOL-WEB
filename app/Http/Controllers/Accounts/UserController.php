<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
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

    public function updateProfile(Request $request) {
      $user = $request->user();

      $validator = Validator::make($request->all(), [
        'name' => 'required',
        'email' => 'required',
        'cp_number' => 'required',
        'location' => 'required',
      ]);

      if($validator->fails()) {
        return response()->json([
          'Message' => $validator->errors(),
        ]);
      }

      $validated = $validator->validated();

      $user->update([
        'name' => $validated['name'] ?? $user->name,
        'email' => $validated['email'] ?? $user->email,
        'cp_number' => $validated['cp_number'] ?? $user->cp_number,
        'location' => $validated['location'] ?? $user->location,
      ]);

      return response()->json([
        'message' => "User Updated Successfully!",
      ]);
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
                "https://sibol-frontend.onrender.com/auth/callback?" . http_build_query([
                    'token' => $token,
                    'role'  => 'user',
                    'name'  => $user->name,
                    'email' => $user->email,
                    'image' => $user->image,
                    'google_id' => $user->google_id,
                    'id' => $user->id,
                ])
            );

        } catch (\Throwable $e) {
            return redirect("https://sibol-frontend.onrender.com/guest/login?error=" . urlencode($e->getMessage()));

        }
    }

    public function forgotPasswordPost(Request $request) {
        $request->validate([
            'email' => 'required|email|exists:users'
        ]);

        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => $token,
            'created_at' => Carbon::now(),
        ]);

        Mail::send('emails.forgotPass', ['token' => $token], function($message) use ($request) {
            $message->to($request->email);
            $message->subject("Reset Password");
        });

        return redirect("https://sibol-frontend.onrender.com/guest/forgot-pass");
    }

    public function resetPassword(Request $request) {
        $request->validate([
            'email' => 'required|email|exists:users',
            'password' => 'required|string|min:6',
            'password_confirmation' => 'required',
        ]);

        $updatePassword = DB::table('password_reset_tokens')->where([
            'email' => $request->email,
            'token' => $request->token,
        ])->first();

        if(!$updatePassword) {
            return redirect()->route('reset')->with('error', "Password Reset Error!")->withInput();
        }

        User::where("email", $request->email)->update(["password" => Hash::make($request->password)]);

        DB::table('password_reset_tokens')->where(["email" => $request->email])->delete();

        return redirect()->route('loginForm')->with('success', 'Password reset success!');
    }
}

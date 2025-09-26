<?php

use App\Http\Controllers\Accounts\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/test', function () {
    return ['message' => 'API IS WORKING!'];
});

Route::post('/register', [UserController::class, 'userRegister']);
Route::post('/login', [UserController::class, 'userLogin']);


Route::middleware('auth:sanctum')->group(function () {
     Route::get('/auth/check', function (Request $request) {
        $user = $request->user();
        $role = $user instanceof \App\Models\User
              ? 'user'
              : ($user instanceof \App\Models\Admin ? 'admin' : 'unknown');
        return response()->json([
            'authenticated' => true,
            'role'          => $role,
            'user'          => $user,
        ]);
    });


    Route::post('/logout', [UserController::class, 'userLogout']);
});


?>

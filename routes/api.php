<?php

use App\Http\Controllers\Accounts\UserController;
use App\Http\Controllers\GardenController;
use App\Http\Controllers\IotController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/test', function () {
    return ['message' => 'API IS WORKING!'];
});

   Route::post('/send', [IotController::class, 'getEspData']);


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

    //User Routes
    Route::post('/addGarden', [GardenController::class, 'addGarden']);
    Route::get('/getLocation', [GardenController::class, 'getLocation']);
    Route::get('/getAirHumidity', [IotController::class, 'getAirHumidity']);
    Route::get('/getGardenData', [GardenController::class, 'getGardenData']);
    Route::get("/getDataByDay/{year}/{month}/{day}", [IotController::class, "getDataByDay"]);
    Route::put('/changePassword', [UserController::class, 'changePassword']);
    Route::post('/logout', [UserController::class, 'userLogout']);
});


?>

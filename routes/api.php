<?php

use App\Http\Controllers\Accounts\UserController;
use App\Http\Controllers\GardenController;
use App\Http\Controllers\IotController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/test', function () {
    return ['message' => 'API IS WORKING!'];
});

// In routes/api.php or routes/web.php
Route::get('/test-cloudinary-direct', function () {
    $cloudName = env('CLOUDINARY_CLOUD_NAME');
    $apiKey = env('CLOUDINARY_API_KEY');
    $apiSecret = env('CLOUDINARY_API_SECRET');

    return response()->json([
        'cloud_name' => $cloudName ?: 'NOT SET',
        'api_key' => $apiKey ?: 'NOT SET',
        'api_secret' => $apiSecret ? 'SET (length: ' . strlen($apiSecret) . ')' : 'NOT SET',
        'all_set' => $cloudName && $apiKey && $apiSecret ? 'YES ✓' : 'NO ✗'
    ]);
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
    Route::post('/addCrop/{garden_id}', [GardenController::class, 'addCrop']);
    Route::get('/getCropData/{garden_id}', [GardenController::class, 'getCropData']);
    Route::post("/addDevice/{gardenId}", [GardenController::class, "generateEsp"]);
    Route::get("/getEsp/{garden_id}", [GardenController::class, 'getEsp']);
    Route::get("/getCrops", [GardenController::class, 'getCrops']);
    Route::get('/monthly-report/{year}/{month}', [IotController::class, 'downloadMonthlyReport']);
    Route::get('/user/crop-profile', [GardenController::class, 'getUserCropProfile']);
    Route::get('/getSensorDataCrop/{garden_id}/{crop}', [GardenController::class, 'getSensorDataCrop']);
    Route::delete("/deleteGarden/{garden_id}", [GardenController::class, 'userGardenDelete']);
    Route::put('/updateCrop/{crop_id}', [GardenController::class, 'updateCrop']);
    Route::delete('/deleteCrop/{crop_id}', [GardenController::class, 'deleteCrop']);


    //Admin Routes
    Route::post("/addAdminCrop", [GardenController::class, 'addAdminCrop']);
    Route::get("/getCropProfile", [GardenController::class, "showCropsProfile"]);
    Route::put('/updateAdminCrop/{id}', [GardenController::class, 'updateAdminCrop']);
    Route::delete('/deleteAdminCrop/{id}', [GardenController::class, 'deleteAdminCrop']);
});


?>

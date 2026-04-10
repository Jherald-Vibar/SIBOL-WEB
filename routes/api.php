<?php

use App\Events\NotificationCreated;
use App\Http\Controllers\Accounts\UserController;
use App\Http\Controllers\DetectionResultController;
use App\Http\Controllers\GardenController;
use App\Http\Controllers\IotController;
use App\Http\Controllers\NotificationController;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;


// routes/api.php
Route::get('/test-notification', function () {
    $userId = auth()->id() ?? 3; // use logged-in user if available
    $user = \App\Models\User::find($userId);

    $notification = Notification::create([
        'user_id'     => $user->id,
        'type'        => 'soil_moisture',
        'title'       => 'WebSocket Test',
        'description' => 'If you see this in real-time, WebSocket is working!',
        'is_read'     => false,
        'priority'    => 'normal',
        'metadata'    => [],
    ]);

    broadcast(new NotificationCreated($notification));

    return response()->json(['message' => 'Notification sent!', 'user_id' => $user->id]);
});

Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
})->middleware('auth:sanctum');

Route::post('/broadcasting/auth-test', function(Request $request) {
    return response()->json([
        'user' => $request->user(),
        'token' => $request->header('Authorization'),
    ]);
})->middleware('auth:sanctum');

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
Route::get('auth/google', [UserController::class, 'redirect']);
Route::get('auth/google/callback', [UserController::class, 'googleAuth']);


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
    Route::delete('/deleteEsp/{espId}',[GardenController::class, 'deleteEsp']);


    //Admin Routes
    Route::post("/addAdminCrop", [GardenController::class, 'addAdminCrop']);
    Route::get('/getCropProfile', [GardenController::class, "showCropsProfile"]);
    Route::put('/updateAdminCrop/{id}', [GardenController::class, 'updateAdminCrop']);
    Route::delete('/deleteAdminCrop/{id}', [GardenController::class, 'deleteAdminCrop']);
    Route::get('/admin/activity-logs', [GardenController::class, 'activityLogs']);



    //Detection
    Route::get('/scan/{sensorDataId}', [DetectionResultController::class, 'getBySensorData']);
    Route::get('/crop/{cropId}/latest-scan', [DetectionResultController::class, 'getLatestScanByCrop']);
    Route::get('/crop/{cropId}/scan-history', [DetectionResultController::class, 'getScanHistoryByCrop']);
    Route::get('/crop/{cropId}/overview', [DetectionResultController::class, 'getCropHealthOverview']);
    Route::get('/esp/{espId}/latest-scan', [DetectionResultController::class, 'getLatestScanByEsp']);
    Route::get('/diseased/current', [DetectionResultController::class, 'getCurrentDiseased']);
    Route::get('/statistics', [DetectionResultController::class, 'getStatistics']);
    //Route::get('/{id}', [DetectionResultController::class, 'getById']);
    Route::get('/getCropAdvisory', [DetectionResultController::class, 'getCropAdvisory']);

    //notification
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'delete']);



});


?>

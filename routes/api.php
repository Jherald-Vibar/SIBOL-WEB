<?php

use Illuminate\Support\Facades\Route;


Route::get('/test', function () {
    return ['message' => 'API IS WORKING!'];
});


?>

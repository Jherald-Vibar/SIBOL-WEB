<?php

use Illuminate\Support\Facades\Broadcast;

// Match the private channel used in React
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    // Only allow the authenticated user to listen to their own notifications
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('garden.{gardenId}', function () {
    return true;
});

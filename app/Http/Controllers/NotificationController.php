<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{ 
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function unread(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->unread()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'count' => $notifications->count(),
            'notifications' => $notifications
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->unread()
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'All notifications marked as read',
            'count' => $count
        ]);
    }

    public function delete(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted'
        ]);
    }
}

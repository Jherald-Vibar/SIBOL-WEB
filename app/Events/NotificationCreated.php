<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public Notification $notification) {}

    public function broadcastOn(): Channel
    {
        // Private channel scoped to the user — e.g. "notifications.42"
        return new Channel('notifications.' . $this->notification->user_id);
    }

    public function broadcastAs(): string
    {
        // React listens for ".notification.created"
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return ['notification' => $this->notification->toArray()];
    }
}

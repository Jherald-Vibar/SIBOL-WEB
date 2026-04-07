<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\PrivateChannel; // ← change this import
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public Notification $notification) {}

    public function broadcastOn(): PrivateChannel // ← and this return type
    {
        return new PrivateChannel('notifications.' . $this->notification->user_id); // ← and this
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return ['notification' => $this->notification->toArray()];
    }
}

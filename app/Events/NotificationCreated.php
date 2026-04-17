<?php

namespace App\Events;

use App\Mail\NotificationMail;
use App\Models\Notification;
use Illuminate\Broadcasting\PrivateChannel; // ← change this import
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public Notification $notification)
    {
        // Send email as soon as the event is instantiated
        Mail::to($this->notification->user->email)
            ->queue(new NotificationMail($this->notification->toArray()));
    }

    public function broadcastOn(): PrivateChannel
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

<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ActivityLogCreated implements ShouldBroadcast
{
    use SerializesModels;

    public $log;

    public function __construct($log)
    {
        $this->log = $log;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('activity-logs'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ActivityLogCreated';
    }
}

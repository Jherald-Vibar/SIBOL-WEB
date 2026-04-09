<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GardenUpdated implements \Illuminate\Contracts\Broadcasting\ShouldBroadcastNow
  {
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public $userId,
        public $action,
        public $garden = null,
        public $gardenId = null
    ) {}

    public function broadcastOn(): array
    {
        // This must match your React: echo.channel(`user-gardens.${userId}`)
        return [new Channel("user-gardens.{$this->userId}")];
    }

    public function broadcastAs(): string
    {
        // This must match your React: .listen('.garden.list.updated', ...)
        return 'garden.list.updated';
    }
}

<?php
namespace App\Events;

use App\Models\LiveLocation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TruckLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public LiveLocation $location) {}

    public function broadcastOn(): array
    {
        return [new Channel('truck-tracking')];
    }

    public function broadcastWith(): array
    {
        return [
            'truck_id' => $this->location->truck_id,
            'lat' => (float) $this->location->latitude,
            'lng' => (float) $this->location->longitude,
            'speed' => $this->location->speed_kmh,
            'updated_at' => $this->location->last_updated?->toISOString(),
        ];
    }
}


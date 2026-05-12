<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryRoute extends Model
{
    protected $fillable = [
        'delivery_id',
        'origin_lat',
        'origin_lng',
        'origin_address',
        'destination_lat',
        'destination_lng',
        'destination_address',
        'total_distance_km',
        'estimated_duration_minutes',
        'waypoints',
    ];

    protected $casts = [
        'origin_lat' => 'decimal:7',
        'origin_lng' => 'decimal:7',
        'destination_lat' => 'decimal:7',
        'destination_lng' => 'decimal:7',
        'total_distance_km' => 'decimal:2',
        'estimated_duration_minutes' => 'integer',
        'waypoints' => 'array',
    ];

    /**
     * Get delivery this route belongs to
     */
    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class);
    }

    /**
     * Calculate straight-line distance between origin and destination
     */
    public function calculateDistance(): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($this->destination_lat - $this->origin_lat);
        $dLon = deg2rad($this->destination_lng - $this->origin_lng);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($this->origin_lat)) * cos(deg2rad($this->destination_lat)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }
}

<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'truck_id',
        'latitude',
        'longitude',
        'speed_kmh',
        'heading',
        'address',
        'distance_traveled_km',
        'distance_remaining_km',
        'estimated_arrival',
        'last_updated',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'speed_kmh' => 'decimal:2',
        'heading' => 'decimal:2',
        'distance_traveled_km' => 'decimal:2',
        'distance_remaining_km' => 'decimal:2',
        'last_updated' => 'datetime',
        'estimated_arrival' => 'datetime',
    ];

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class);
    }

    /**
     * Update location with new GPS data
     */
    public function updatePosition(float $lat, float $lng, ?float $speed = null, ?float $heading = null)
    {
        $this->update([
            'latitude' => $lat,
            'longitude' => $lng,
            'speed_kmh' => $speed,
            'heading' => $heading,
            'last_updated' => now(),
        ]);
    }
}

<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Truck extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate_number',
        'model',
        'status',
        'vehicle_type',
        'fuel_level',
        'capacity_tons',
        'active_delivery_id',
        'driver_id',
    ];

    protected $casts = [
        'fuel_level' => 'integer',
        'capacity_tons' => 'decimal:2',
    ];

    /**
     * Get truck's current live location
     */
    public function liveLocation(): HasOne
    {
        return $this->hasOne(LiveLocation::class);
    }

    /**
     * Get truck's active delivery
     */
    public function activeDelivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class, 'active_delivery_id');
    }

    /**
     * Get truck's assigned driver
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Scope for trucks currently in transit
     */
    public function scopeInTransit($query)
    {
        return $query->where('status', 'in_transit');
    }

    /**
     * Scope for available trucks
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'idle');
    }

    public function trackingLogs()
    {
        return $this->hasMany(TrackingLog::class)->latest('logged_at');
    }

    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }
}


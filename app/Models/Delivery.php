<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Delivery extends Model
{
    protected $fillable = [
        'tracking_number',
        'status',
        'customer_name',
        'customer_phone',
        'notes',
        'scheduled_date',
        'completed_at',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completed_at' => 'datetime',
    ];

    /**
     * Get route for this delivery
     */
    public function route(): HasOne
    {
        return $this->hasOne(DeliveryRoute::class);
    }

    /**
     * Get truck assigned to this delivery
     */
    public function truck(): HasOne
    {
        return $this->hasOne(Truck::class, 'active_delivery_id');
    }
}

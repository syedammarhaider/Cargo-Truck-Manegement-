<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrackingLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'truck_id',
        'shipment_id',
        'latitude',
        'longitude',
        'speed_kmh',
        'heading',
        'logged_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'speed_kmh' => 'decimal:2',
        'heading' => 'decimal:2',
        'logged_at' => 'datetime',
    ];

    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class);
    }
}

<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_number',
        'truck_id',
        'user_id',
        'origin',
        'destination',
        'weight_kg',
        'volume_m3',
        'status',
        'price',
        'notes',
        'estimated_delivery',
    ];

    protected $casts = [
        'estimated_delivery' => 'datetime',
        'price' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (Shipment $shipment): void {
            if (! empty($shipment->tracking_number)) {
                return;
            }

            $year = date('Y');

            // Concurrency-safe: use an atomic sequence per year.
            $sequence = (int) self::query()
                ->whereYear('created_at', (int) $year)
                ->lockForUpdate()
                ->max('id');

            // Fallback if created_at filtering is not reliable early in the lifecycle.
            $sequence = $sequence > 0 ? ($sequence + 1) : (self::query()->count() + 1);

            $shipment->tracking_number = sprintf('TCMS-%s-%04d', $year, $sequence);
        });
    }


    public function truck()
    {
        return $this->belongsTo(Truck::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


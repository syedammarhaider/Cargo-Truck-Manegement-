<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'user_id',
        'shipment_id',
        'total',
        'due_date',
        'status',
        'notes'
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'due_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    public function getFormattedTotalAttribute(): string
    {
        return number_format($this->total, 2);
    }

    public function getFormattedDueDateAttribute(): string
    {
        return $this->due_date ? $this->due_date->format('M d, Y') : '';
    }
}

<?php
namespace App\Jobs;

use App\Mail\ShipmentCreated;
use App\Models\Shipment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendShipmentNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(public Shipment $shipment) {}

    public function handle(): void
    {
        $customer = $this->shipment->customer;
        Mail::to($customer->email)->send(new ShipmentCreated($this->shipment));
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Shipment email failed', [
            'shipment_id' => $this->shipment->id,
            'error' => $exception->getMessage(),
        ]);
    }
}


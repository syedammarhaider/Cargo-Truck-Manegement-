<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .card { background: white; border-radius: 8px; padding: 32px; max-width: 500px; margin: 0 auto; }
        .header { background: #1e293b; color: white; padding: 16px 24px; border-radius: 8px; margin-bottom: 24px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .label { color: #888; font-size: 13px; }
        .value { font-weight: bold; color: #333; }
        .badge { background: #0ea5e9; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h2 style="margin:0">🚛 Shipment Confirmed</h2>
            <p style="margin:4px 0 0;opacity:0.7">Truck Cargo Management System</p>
        </div>

        <p>Hello <strong>{{ $shipment->customer->name }}</strong>,</p>
        <p>Your shipment has been booked successfully!</p>

        <div class="row">
            <span class="label">Tracking Number</span>
            <span class="value">{{ $shipment->tracking_number }}</span>
        </div>
        <div class="row">
            <span class="label">From</span>
            <span class="value">{{ $shipment->origin }}</span>
        </div>
        <div class="row">
            <span class="label">To</span>
            <span class="value">{{ $shipment->destination }}</span>
        </div>
        <div class="row">
            <span class="label">Weight</span>
            <span class="value">{{ $shipment->weight_kg }} KG</span>
        </div>
        <div class="row">
            <span class="label">Price</span>
            <span class="value">PKR {{ number_format($shipment->price, 0) }}</span>
        </div>
        <div class="row">
            <span class="label">Estimated Delivery</span>
            <span class="value">{{ $shipment->estimated_delivery?->format('d M Y') }}</span>
        </div>
        <div class="row">
            <span class="label">Assigned Truck</span>
            <span class="value">{{ $shipment->truck->plate_number }}</span>
        </div>

        <p style="margin-top: 24px; color: #666; font-size: 13px;">
            Track your shipment in real-time on our portal.
        </p>
    </div>
</body>
</html>


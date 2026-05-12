<?php
namespace Database\Seeders;

use App\Models\Delivery;
use App\Models\DeliveryRoute;
use App\Models\Invoice;
use App\Models\Shipment;
use App\Models\Truck;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@tcms.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Create customer
        $customer = User::updateOrCreate(
            ['email' => 'customer@tcms.com'],
            [
                'name' => 'Test Customer',
                'password' => Hash::make('password'),
                'role' => 'customer',
            ]
        );

        // Create drivers
        $driver1 = User::updateOrCreate(
            ['email' => 'driver1@tcms.com'],
            [
                'name' => 'John Driver',
                'password' => Hash::make('password'),
                'role' => 'driver',
            ]
        );

        $driver2 = User::updateOrCreate(
            ['email' => 'driver2@tcms.com'],
            [
                'name' => 'Mike Driver',
                'password' => Hash::make('password'),
                'role' => 'driver',
            ]
        );

        // Create trucks
        $truck1 = Truck::updateOrCreate(
            ['plate_number' => 'ABC-123'],
            [
                'model' => 'Toyota Hilux',
                'capacity_tons' => 1.0,
                'status' => 'idle',
                'driver_name' => $driver1->name,
                'fuel_level' => 85,
            ]
        );

        $truck2 = Truck::updateOrCreate(
            ['plate_number' => 'XYZ-456'],
            [
                'model' => 'Ford Transit',
                'capacity_tons' => 1.5,
                'status' => 'in_transit',
                'driver_name' => $driver2->name,
                'fuel_level' => 92,
            ]
        );

        $truck3 = Truck::updateOrCreate(
            ['plate_number' => 'DEF-789'],
            [
                'model' => 'Isuzu NPR',
                'capacity_tons' => 2.0,
                'status' => 'maintenance',
                'driver_name' => 'Maintenance Crew',
                'fuel_level' => 45,
            ]
        );

        $truck4 = Truck::updateOrCreate(
            ['plate_number' => 'GHI-012'],
            [
                'model' => 'Mitsubishi L200',
                'capacity_tons' => 1.2,
                'status' => 'idle',
                'driver_name' => 'Available',
                'fuel_level' => 78,
            ]
        );

        // Create shipments
        Shipment::updateOrCreate(
            ['tracking_number' => 'TCMS-2026-0001'],
            [
                'user_id' => $customer->id,
                'truck_id' => $truck1->id,
                'origin' => 'Karachi',
                'destination' => 'Lahore',
                'weight_kg' => 5000,
                'volume_m3' => 18.5,
                'price' => 25000,
                'status' => 'pending',
                'notes' => 'Electronics shipment',
                'estimated_delivery' => now()->addDays(3),
            ]
        );

        Shipment::updateOrCreate(
            ['tracking_number' => 'TCMS-2026-0002'],
            [
                'user_id' => $customer->id,
                'truck_id' => $truck2->id,
                'origin' => 'Islamabad',
                'destination' => 'Peshawar',
                'weight_kg' => 3500,
                'volume_m3' => 15.2,
                'price' => 18000,
                'status' => 'pending',
                'notes' => 'Textile goods',
                'estimated_delivery' => now()->addDays(2),
            ]
        );

        Shipment::updateOrCreate(
            ['tracking_number' => 'TCMS-2026-0003'],
            [
                'user_id' => $customer->id,
                'truck_id' => $truck3->id,
                'origin' => 'Faisalabad',
                'destination' => 'Multan',
                'weight_kg' => 7500,
                'volume_m3' => 25.8,
                'price' => 42000,
                'status' => 'delivered',
                'notes' => 'Machinery parts',
                'estimated_delivery' => now()->subDays(1),
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(1),
            ]
        );

        // Create historical shipments for revenue data
        for ($i = 1; $i <= 6; $i++) {
            Shipment::updateOrCreate(
                ['tracking_number' => 'TCMS-2026-HIST-' . str_pad($i, 3, '0', STR_PAD_LEFT)],
                [
                    'user_id' => $customer->id,
                    'truck_id' => $truck1->id,
                    'origin' => 'City ' . $i,
                    'destination' => 'Destination ' . $i,
                    'weight_kg' => rand(2000, 8000),
                    'volume_m3' => rand(10, 30),
                    'price' => rand(15000, 50000),
                    'status' => 'delivered',
                    'notes' => 'Historical shipment ' . $i,
                    'estimated_delivery' => now()->subMonths($i - 1)->addDays(3),
                    'created_at' => now()->subMonths($i - 1),
                    'updated_at' => now()->subMonths($i - 1),
                ]
            );
        }

        // Create invoices
        for ($j = 1; $j <= 5; $j++) {
            Invoice::updateOrCreate(
                ['invoice_number' => 'INV-2026-' . str_pad($j, 4, '0', STR_PAD_LEFT)],
                [
                    'user_id' => $customer->id,
                    'shipment_id' => $j <= 3 ? $customer->shipments->skip($j - 1)->first()->id : null,
                    'total' => rand(5000, 50000),
                    'due_date' => now()->addDays(rand(15, 60)),
                    'status' => $j <= 2 ? 'paid' : ($j == 3 ? 'unpaid' : 'overdue'),
                    'notes' => 'Invoice for shipment services',
                ]
            );
        }

        // Create sample deliveries
        for ($k = 1; $k <= 3; $k++) {
            $delivery = Delivery::updateOrCreate(
                ['tracking_number' => 'DEL-2026-' . str_pad($k, 3, '0', STR_PAD_LEFT)],
                [
                    'status' => $k <= 1 ? 'delivered' : ($k == 2 ? 'in_progress' : 'pending'),
                    'customer_name' => 'Customer ' . $k,
                    'customer_phone' => '+1-555-' . str_pad($k * 100, 4, '0', STR_PAD_LEFT),
                    'notes' => 'Delivery notes ' . $k,
                    'scheduled_date' => now()->addDays($k),
                    'completed_at' => $k <= 1 ? now()->subDays($k) : null,
                ]
            );

            // Create delivery routes
            DeliveryRoute::updateOrCreate(
                ['delivery_id' => $delivery->id],
                [
                    'origin_lat' => 40.7128 + ($k * 0.1),
                    'origin_lng' => -74.0060 + ($k * 0.1),
                    'origin_address' => 'Origin Address ' . $k,
                    'destination_lat' => 40.7580 + ($k * 0.1),
                    'destination_lng' => -73.9855 + ($k * 0.1),
                    'destination_address' => 'Destination Address ' . $k,
                    'total_distance_km' => rand(10, 100),
                    'estimated_duration_minutes' => rand(30, 120),
                    'waypoints' => $k > 1 ? [['lat' => 40.7300, 'lng' => -74.0000, 'address' => 'Stop ' . $k]] : null,
                ]
            );
        }
    }
}




<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Truck;
use App\Models\Shipment;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@tcms.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create customer
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@tcms.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        // Create drivers
        $driver1 = User::create([
            'name' => 'John Driver',
            'email' => 'driver1@tcms.com',
            'password' => bcrypt('password'),
            'role' => 'driver',
        ]);

        $driver2 = User::create([
            'name' => 'Mike Driver',
            'email' => 'driver2@tcms.com',
            'password' => bcrypt('password'),
            'role' => 'driver',
        ]);

        // Create trucks
        $truck1 = Truck::create([
            'plate_number' => 'ABC-123',
            'make' => 'Toyota',
            'model' => 'Hilux',
            'year' => 2022,
            'capacity' => 1000,
            'status' => 'idle',
            'driver_id' => $driver1->id,
        ]);

        $truck2 = Truck::create([
            'plate_number' => 'XYZ-456',
            'make' => 'Ford',
            'model' => 'Transit',
            'year' => 2023,
            'capacity' => 1500,
            'status' => 'in_transit',
            'driver_id' => $driver2->id,
        ]);

        $truck3 = Truck::create([
            'plate_number' => 'DEF-789',
            'make' => 'Isuzu',
            'model' => 'NPR',
            'year' => 2021,
            'capacity' => 2000,
            'status' => 'maintenance',
        ]);

        $truck4 = Truck::create([
            'plate_number' => 'GHI-012',
            'make' => 'Mitsubishi',
            'model' => 'L200',
            'year' => 2023,
            'capacity' => 1200,
            'status' => 'idle',
        ]);

        // Create shipments
        Shipment::create([
            'tracking_number' => 'TCMS-2026-0001',
            'customer_id' => $customer->id,
            'truck_id' => $truck1->id,
            'origin' => 'Karachi',
            'destination' => 'Lahore',
            'price' => 25000,
            'status' => 'pending',
            'description' => 'Electronics shipment',
        ]);

        Shipment::create([
            'tracking_number' => 'TCMS-2026-0002',
            'customer_id' => $customer->id,
            'truck_id' => $truck2->id,
            'origin' => 'Islamabad',
            'destination' => 'Peshawar',
            'price' => 18000,
            'status' => 'pending',
            'description' => 'Textile goods',
        ]);

        Shipment::create([
            'tracking_number' => 'TCMS-2026-0003',
            'customer_id' => $customer->id,
            'truck_id' => $truck3->id,
            'origin' => 'Faisalabad',
            'destination' => 'Multan',
            'price' => 42000,
            'status' => 'delivered',
            'description' => 'Machinery parts',
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(1),
        ]);

        // Create some historical shipments for revenue data
        for ($i = 1; $i <= 6; $i++) {
            Shipment::create([
                'tracking_number' => 'TCMS-2026-HIST-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'customer_id' => $customer->id,
                'truck_id' => $truck1->id,
                'origin' => 'City ' . $i,
                'destination' => 'Destination ' . $i,
                'price' => rand(15000, 50000),
                'status' => 'delivered',
                'description' => 'Historical shipment ' . $i,
                'created_at' => now()->subMonths($i - 1),
                'updated_at' => now()->subMonths($i - 1),
            ]);
        }
    }
}

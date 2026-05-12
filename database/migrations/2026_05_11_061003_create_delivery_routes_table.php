<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('delivery_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_id')->constrained('deliveries')->onDelete('cascade');
            
            // Origin coordinates and address
            $table->decimal('origin_lat', 10, 7);
            $table->decimal('origin_lng', 10, 7);
            $table->string('origin_address', 500);
            
            // Destination coordinates and address
            $table->decimal('destination_lat', 10, 7);
            $table->decimal('destination_lng', 10, 7);
            $table->string('destination_address', 500);
            
            // Route metadata
            $table->decimal('total_distance_km', 10, 2)->nullable();
            $table->integer('estimated_duration_minutes')->nullable();
            $table->json('waypoints')->nullable(); // Store intermediate stops
            
            $table->timestamps();
            
            $table->index('delivery_id');
        });

        // Add active_delivery_id to trucks table if it doesn't exist
        if (!Schema::hasColumn('trucks', 'active_delivery_id')) {
            Schema::table('trucks', function (Blueprint $table) {
                $table->foreignId('active_delivery_id')->nullable()->constrained('deliveries')->nullOnDelete();
                $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('delivery_routes');
        
        if (Schema::hasColumn('trucks', 'active_delivery_id')) {
            Schema::table('trucks', function (Blueprint $table) {
                $table->dropForeign(['active_delivery_id']);
                $table->dropColumn('active_delivery_id');
                
                if (Schema::hasColumn('trucks', 'driver_id')) {
                    $table->dropForeign(['driver_id']);
                    $table->dropColumn('driver_id');
                }
            });
        }
    }
};

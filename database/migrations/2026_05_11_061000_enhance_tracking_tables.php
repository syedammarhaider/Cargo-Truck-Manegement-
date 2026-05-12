<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Enhance live_locations table - only add missing columns
        Schema::table('live_locations', function (Blueprint $table) {
            if (!Schema::hasColumn('live_locations', 'heading')) {
                $table->decimal('heading', 5, 2)->nullable()->after('speed_kmh');
            }
            if (!Schema::hasColumn('live_locations', 'address')) {
                $table->string('address', 500)->nullable()->after('heading');
            }
            if (!Schema::hasColumn('live_locations', 'distance_traveled_km')) {
                $table->decimal('distance_traveled_km', 10, 2)->nullable()->after('address');
            }
            if (!Schema::hasColumn('live_locations', 'distance_remaining_km')) {
                $table->decimal('distance_remaining_km', 10, 2)->nullable()->after('distance_traveled_km');
            }
            if (!Schema::hasColumn('live_locations', 'estimated_arrival')) {
                $table->timestamp('estimated_arrival')->nullable()->after('distance_remaining_km');
            }
        });

        // Enhance tracking_logs table - only add missing columns
        Schema::table('tracking_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('tracking_logs', 'heading')) {
                $table->decimal('heading', 5, 2)->nullable()->after('speed_kmh');
            }
        });
    }

    public function down()
    {
        Schema::table('live_locations', function (Blueprint $table) {
            $table->dropColumn([
                'heading',
                'address',
                'distance_traveled_km',
                'distance_remaining_km',
                'estimated_arrival'
            ]);
        });

        Schema::table('tracking_logs', function (Blueprint $table) {
            $table->dropColumn('heading');
        });
    }
};

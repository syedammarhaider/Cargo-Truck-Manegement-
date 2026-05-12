<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trucks', function (Blueprint $table) {
            $table->id();
            $table->string('plate_number')->unique();
            $table->string('model');
            $table->decimal('capacity_tons', 8, 2);
            $table->enum('status', ['idle', 'in_transit', 'maintenance'])->default('idle');
            $table->string('driver_name')->nullable();
            $table->decimal('fuel_level', 5, 2)->default(100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trucks');
    }
};


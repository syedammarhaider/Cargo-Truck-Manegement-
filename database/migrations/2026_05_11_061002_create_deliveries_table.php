<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number')->unique();
            $table->string('status');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('notes')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index('tracking_number');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('deliveries');
    }
};

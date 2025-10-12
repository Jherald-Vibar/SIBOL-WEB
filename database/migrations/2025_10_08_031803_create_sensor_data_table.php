<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sensor_data', function (Blueprint $table) {
        $table->id();
        $table->foreignId('esp_id')->constrained()->onDelete('cascade');
        $table->foreignId('crop_id')->nullable()->constrained()->onDelete('cascade');

        $table->float('soil_moisture')->nullable();
        $table->float('soil_temperature')->nullable();
        $table->float('electrical_conductivity')->nullable();
        $table->float('ph')->nullable();
        $table->float('nitrogen')->nullable();
        $table->float('phosphorus')->nullable();
        $table->float('potassium')->nullable();

        $table->float('air_temperature')->nullable();
        $table->float('air_humidity')->nullable();

        $table->timestamps();
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensor_data');
    }
};

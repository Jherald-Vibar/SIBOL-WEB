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
       Schema::create('crop_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_id')->constrained()->onDelete('cascade');
            $table->float('soil_moisture_min')->nullable();
            $table->float('soil_moisture_max')->nullable();
            $table->float('soil_temperature_min')->nullable();
            $table->float('soil_temperature_max')->nullable();
            $table->float('electrical_conductivity_min')->nullable();
            $table->float('electrical_conductivity_max')->nullable();
            $table->float('ph_min')->nullable();
            $table->float('ph_max')->nullable();
            $table->float('nitrogen_min')->nullable();
            $table->float('nitrogen_max')->nullable();
            $table->float('phosphorus_min')->nullable();
            $table->float('phosphorus_max')->nullable();
            $table->float('potassium_min')->nullable();
            $table->float('potassium_max')->nullable();
            $table->float('air_temperature_min')->nullable();
            $table->float('air_temperature_max')->nullable();
            $table->float('air_humidity_min')->nullable();
            $table->float('air_humidity_max')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crop_profiles');
    }
};

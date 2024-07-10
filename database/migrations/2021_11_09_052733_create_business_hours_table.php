<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBusinessHoursTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('business_hours', function (Blueprint $table) {
            $table->id('id');
            $table->string('name')->unique()->index();
            $table->string('slug');
            $table->text('description')->nullable();
            $table->unsignedInteger('time_zone_id')->nullable()->default(0);
            // $table->unsignedInteger('holi_day_id')->nullable()->default(0);
            $table->tinyInteger('status')->comment('0 => Inactive, 1 => Active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('business_hours');
    }
}

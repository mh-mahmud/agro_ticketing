<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTicketForwardTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ticket_forwards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('ticket_id');// Foreign key
            $table->unsignedBigInteger('group_id')->nullable()->default(0);// Foreign key
            // $table->string('agent_id')->nullable()->comment('User id whose role is agent');// Foreign key
            $table->unsignedBigInteger('forward_by')->comment('User ID');// Foreign key, User ID
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
        Schema::dropIfExists('ticket_forward');
    }
}

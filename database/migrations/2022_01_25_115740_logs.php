<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class Logs extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('ip', 40)->comment('Client IP address');
            $table->string('user_agent')->comment('User\'s mechine info');
            $table->enum('action', ['insert', 'update', 'delete', 'login', 'logout']);
            $table->string('operated_table', 40)->nullable();
            $table->string('operated_row_id', 40)->nullable();
            $table->string('user_id', 40);
            $table->text('previous_data')->nullable();
            $table->string('note')->nullable();
            $table->timestamp('created_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('logs');
    }
}

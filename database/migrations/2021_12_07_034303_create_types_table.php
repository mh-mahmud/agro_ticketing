<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('types', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('parent_id')->default(0)->comment('0 = Top node');
            $table->string('name')->unique()->index();
            $table->string('slug');
            $table->text('description')->nullable();
            $table->integer('day')->default(0);
            $table->integer('hour')->default(0);
            $table->integer('min')->default(0);
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
        Schema::dropIfExists('types');
    }
}

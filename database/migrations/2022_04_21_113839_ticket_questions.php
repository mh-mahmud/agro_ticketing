<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class TicketQuestions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ticket_questions', function (Blueprint $table) {
            $table->string('ticket_id');
            $table->string('question_id');
            $table->string('answer');

            //FOREIGN KEY CONSTRAINTS
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');

            //SETTING THE PRIMARY KEYS
            $table->primary(['ticket_id', 'question_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ticket_questions');
    }
}

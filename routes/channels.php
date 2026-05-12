<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('truck-tracking', function () {
    return true;
});


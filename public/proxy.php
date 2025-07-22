<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

echo file_get_contents("https://dragonmontainapi.com/riwayat_laporan.php?user=1");

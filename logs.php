<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/plain; charset=utf-8");

$possible_paths = [
    __DIR__ . '/server_log.txt',
    __DIR__ . '/../server_log.txt',
    __DIR__ . '/../../server_log.txt'
];

$found = false;
foreach ($possible_paths as $path) {
    if (file_exists($path)) {
        echo "=== Logs from " . realpath($path) . " ===\n\n";
        echo file_get_contents($path);
        $found = true;
        break;
    }
}

if (!$found) {
    echo "server_log.txt not found in any of the checked paths:\n";
    print_r($possible_paths);
    
    // Also show directory contents to help locate it
    echo "\n=== Current Directory Contents ===\n";
    $files = scandir(__DIR__);
    print_r($files);
}
?>

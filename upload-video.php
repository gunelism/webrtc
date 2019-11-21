<?php 

require './vendor/autoload.php';

function upload_object($bucketName, $objectName, $source)
{
    $cloud = new Google\Cloud\Core\ServiceBuilder([
        'keyFilePath' => './cloudStorage/cloudStorage.json'
    ]);

    $storage = $cloud->storage();
    $bucket = $storage->bucket('singularity_task');
    $object = $bucket->upload(file_get_contents($source), [
      'name' => $objectName
    ]);

    printf('Uploaded %s to gs://%s/%s' . PHP_EOL, basename($source), $bucketName, $objectName);
} 
function convertFile($uploadDirectory, $fileNameM){
   $ffmpeg = FFMpeg\FFMpeg::create(array(
        'ffmpeg.binaries' => './ffmpeg/ffmpeg.exe',
        'ffprobe.binaries' => './ffmpeg/ffprobe.exe',
        'timeout' => 3600, 
        'ffmpeg.threads' => 12, 
        ), @$logger);
        $video = $ffmpeg->open($uploadDirectory);
        $video->save(new FFMpeg\Format\Video\X264(), './output/'.$fileNameM);
}
function convertAudio($uploadDirectory, $fileName){
  shell_exec("ffmpeg -i ".$uploadDirectory." -vn -ab 128k -ar 44100 -y ./output/".$fileName.".mp3");
}
if(isset($_FILES["video"]) && $_SERVER['REQUEST_METHOD'] === 'POST' ){
    $type = $_POST["type"];
    $fileName = time();
    $fileNameW = $fileName.".webm";
    $fileNameM = $fileName.($type=="video" ? ".mp4" : ".mp3");

    if (!file_exists('./uploads')) mkdir('./uploads', 0777, true);
    if (!file_exists('./output')) mkdir('./output', 0777, true);

    $uploadDirectory = './uploads/'. $fileNameW;
    
    if (!move_uploaded_file($_FILES["video"]["tmp_name"], $uploadDirectory)) {
        echo("Couldn't upload video !");
    }else{
      if($type=="audio")
        convertAudio($uploadDirectory, $fileName);
      else 
        convertFile($uploadDirectory, $fileNameM);

        //upload to cloud
      upload_object("singularity_task", $fileNameM, "./output/".$fileNameM);
    } 
}
else{
    echo "No file uploaded"; 
}



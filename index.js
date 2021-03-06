#!/usr/bin/env node

var fs = require('fs'),
    ffmpeg = require('fluent-ffmpeg'),
    ytdl = require('ytdl');

var program = require('commander');

program
  .version('0.0.1')
  .option('-u, --url <url>', 'youtube url')
  .option('-f, --format <format>', 'output format, i.e flv or mp3')
  .parse(process.argv);

    if(program.url && program.format) {
      console.log("----- Downloading -----");
      convertToMp3 = program.format == "mp3" ? true : false;
      dlyt(program.url, convertToMp3);
    }
    else {
      console.log("URL or file format not defined");
    }

function dlyt(path, convertToMp3){
  ytdl.getInfo(path, function(err, info) {
    var fileName = err ? "ytmp3.flv" : sanatize(info.title.trim() + ".flv");
    var stream = fs.createWriteStream(fileName);
    ytdl(path).pipe(stream).on('close', function() {
      console.log("----- Download complete -----");
      if(convertToMp3) {
        stream.end();
        console.log("----- converting to mp3 -----");
        var fileEnd = /\.flv$/;
        convert(fileName, fileName.replace(fileEnd, '.mp3'));
      }
    });
  });
}
/* Title which starts with a dash will cause ffmpeg to think its an option, 
so they need to be removed.*/
function sanatize(title) {
  
  while(title.charAt(0) == '-')
    title = title.substr(1);
  return title;
}

function convert (source, destination) {
  var proc = new ffmpeg({ source: source , nolog: true, timeout: 60 })
    .withAudioCodec('libmp3lame')
    .toFormat('mp3')
    .saveToFile(destination, function(stdout, stderr) {
          console.log('----- file converted successfully! -----');
        fs.unlink(source, function(err) {
          console.log("----- Removing temporary file: " + source);         
        });
    });
}


var fs = require('hexo-fs');
var path = require('path');
var ejs = require('ejs');

hexo.extend.tag.register('autogallery', function(args) {
  var layout = args[0]
  var relativeDir = args[1];
  var descName = args[2];

  var dir = path.join(hexo.source_dir, relativeDir);
  var themePath = path.join(hexo.theme_dir, 'layout', '_page', layout + '.ejs')

  if (hexo.env.debug) {
    console.log('[Autogallery] Running autogallery on ' +  dir + ', using layout ' + themePath);
  }

  try {
    var files = fs.listDirSync(dir);
    var template = fs.readFileSync(themePath)

    var photos = files.map(f => relativeDir + '/' + f)
    console.error(photos);
    return ejs.render(template, {
      photos: photos,
      name: descName,
      config: hexo.config
    })

  } catch (e) {
    console.error(e);
    return '<h3>Could not render autogallery at ' + relativeDir + ' using ' + layout + ' layout</h3>'
  }
});

/**
 * Created by lzane on 8/20/17.
 */
 var imgRgr = /<img [^>]+>/g;

 function ignore(data) {
   var source = data.source;
   var ext = source.substring(source.lastIndexOf('.')).toLowerCase();
   return ['.js', '.css', '.html', '.htm'].indexOf(ext) > -1;
 }
 
 function addTag(data){
     var config = this.config.lightgallery;
     if(!config){
         return;
     }
 
     // add js
     data.content = '<div class=".article-gallery">'+data.content+'</div>';
     data.content+='<script src="'+config.js+'"></script>';
 
     // add css
     var css = '<link rel="stylesheet" type="text/css" href="'+config.css+'" />';
     data.content = css + data.content;
 
     // add plugins
     var plugins = Object.keys(config.plugins);
     for (var plugin of plugins){
         var jsTag = '<script src="'+config.plugins[plugin]+'"></script>';
         data.content += jsTag;
     }
 }
 
 function addRunnableTag(data){
     data.content+='<script>'+
         `if (typeof lightGallery !== 'undefined') {
         var options = {
             selector: '.gallery-item'
         };
         lightGallery(document.getElementsByClassName('.article-gallery')[0], options);
         }`
         +'</script>';
 }
 
 function wrapImage(data){
     data.content = data.content.replace(imgRgr, function replace(match){
         var res = '<a ';
         var hrefResult = /src\s*=\s*"(.+?)"/g.exec(match);
         if (hrefResult){
             var href = hrefResult[1];
             res+='href="'+href+'" ';
         }
         var titleResult = /alt\s*=\s*"(.+?)"/g.exec(match);
         if (titleResult){
             var title = titleResult[1];
             res+='title="'+title+'" ';
         }
         res+='class="gallery-item gallery-img col-xs-3">'+match+'</a>';
         return res;
     });
 }
 
 function render(data){
     if (ignore(data)){
         return;
     }
     wrapImage.call(this,data);
     addTag.call(this,data);
     addRunnableTag.call(this,data);
 };
 
 exports.render = render;
 
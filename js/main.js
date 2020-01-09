// Canvas resize to fit relative div size
  var canvas = document.querySelector('canvas');
  fitParentElement(canvas);

  function fitParentElement(canvas){
    // Fill canavas to same as parent
    canvas.style.width ='100%';
    canvas.style.height='100%';
    // Set internal size to match
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
// 

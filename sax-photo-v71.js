function zoomSaxPhoto(value){const img=document.getElementById('saxPhoto');if(img){img.style.width=(100*value)+'%';img.style.height=value===1?'100%':'auto'}}
function resetSaxPhoto(){zoomSaxPhoto(1);const slider=document.getElementById('saxPhotoZoom');if(slider)slider.value=1;const viewport=document.getElementById('sax3d');if(viewport){viewport.scrollTop=0;viewport.scrollLeft=0}}

'use strict';

document.addEventListener("DOMContentLoaded", function (){

    heroFullVH(); // call the heroFullVH function to create the hero image

    // set the extreme screen size values in order to use them for calculations later
    const highestPossibleWpxHpx = 15360 + 8640;
    const minimumPossibleWpxHpx = 160 + 160;

    // get current window dimensions
    let currentWpxHpx = window.innerWidth + window.innerHeight;
    let viewportNormalizer = (currentWpxHpx - minimumPossibleWpxHpx) / (highestPossibleWpxHpx - minimumPossibleWpxHpx);

    // select the individual hero elements to animate them properly
    const backgroundImgs = document.querySelectorAll('.parallax .background');
    const foregroundTitle = document.querySelectorAll('.parallax .content h2 span');
    const foregroundRestContent = document.querySelectorAll('.parallax .content *:not(h1, h2, h3, h4, h5, h6, h1 span, h2 span, h3 span, h4 span, h5 span, h6 span)');
    /* const foregroundContents = document.querySelectorAll('.parallax .content'); */

    let initialBgPosY = []; // get initial Y background position
    for (let bg = 0; bg < backgroundImgs.length; bg++) {
        initialBgPosY[bg] = window.getComputedStyle(backgroundImgs[bg]).backgroundPositionY;
    }

    window.addEventListener("scroll", function() {
        // every time the scroll event is triggered, animate/stylize the selected elements
        for (let bg = 0; bg < backgroundImgs.length; bg++) {
          let offsetY = window.pageYOffset;
          backgroundImgs[bg].style.backgroundPositionY = 'calc(' + initialBgPosY[bg] + ' - ' + offsetY * 0.15 + 'px)'; // moves the background vertically
        }

        /*
        for (let fg = 0; fg < foregroundContents.length; fg++) {
            let offsetY = window.pageYOffset;
            foregroundContents[fg].style.margin = '-' + offsetY * 0.2 + "px 0 0 0"; // moves the contents vertically
        }
        */

        for (let fgt = 0; fgt < foregroundTitle.length; fgt++) {
            let offsetY = window.pageYOffset;
            foregroundTitle[fgt].style.transform = 'translateX(' + Math.ceil(Math.pow(2,viewportNormalizer)*offsetY / (fgt+1)) + "px)"; // use the viewport normalizer to animate the element in relation to the scrolled Y offset
            foregroundTitle[fgt].parentElement.style.opacity = 1 - (offsetY - 0)/(window.innerHeight - 0); // Fade the selected element as the user scrolls
        }


        for (let fgrc = 0; fgrc < foregroundRestContent.length; fgrc++) {
            let offsetY = window.pageYOffset;
            foregroundRestContent[fgrc].style.opacity = 1 - (offsetY - 0)/(window.innerHeight - 0); // Fade the selected element as the user scrolls
            foregroundRestContent[fgrc].style.transform = 'translateY(' + offsetY * 0.2 + "px)";// moves the selected element vertically
        }
      });
});

function heroFullVH() {
    // this function will set the hero image to fill the viewport
    let heroImages = document.getElementsByClassName('hero_image');
    let header = document.getElementsByTagName('header')[0];
    heroImages[0].style.height = Math.round(window.innerHeight) - header.clientHeight + 'px';
    if(window.innerHeight > 2560 || window.innerWidth > 2560){
        // if the screen size is very large, then fill half of it with the hero image
        heroImages[0].style.height = parseInt(window.getComputedStyle(heroImages[0]).height, 10)/2 + 'px';
    }
}


window.addEventListener('resize', function(event) {
    // every time the window is resized call the heroFullVH function to recalculate and position the hero image correctly
    heroFullVH();
}, true);
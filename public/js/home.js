var primary = new RegExp('^(http://|https://)', 'i');
var setWidth = 'full';

// jQuery event listeners

$(function() {
  $(window).scroll(function() {
    if ($(window).scrollTop() > 149) {
      if (!$('.pinIcon').is(":visible")) {
        $('.pinIcon').show();
      }
    } else {
      if ($('.pinIcon').is(":visible")) {
        $('.pinIcon').hide();
      }
    }
  })
})

$(function() {
  $('.link, .tagLink').click(function(event){
    event.stopPropagation();
  })
})

$(function() {
  $('.linkBox').click(function() {
    window.open($(this).find('#bounceUrl').val(), '_blank');
  })
})

$(function() {
  $('#pinToggle, .pinIcon').click(function(event) {
    event.preventDefault();
    if (previewIsOpen()) {
      closePreview();
      resetPreview();
    } else {
      openPreview();
    }
  });
})

$(function() {
  $('.deleteLink').click(function(event) {
    event.preventDefault();
    var r = confirm("Are you sure you want to delete this bookmark?");
    if (r == true) {
      window.location = $(this).attr('href');
    }
  })
})

// just make this use the pinNew format
$(function() {
  $('.updateLink').click(function (event) {
    event.preventDefault();
    //alert('Right now, you can update this link by readding it. In the future, we will have a better system. Thanks!');
    openPreview();
    advancePreview();
    setPreview($(this).attr('data-url'), $(this).attr('data-title'), $(this).attr('data-note'), $(this).attr('data-tags'), $(this).attr('data-image'))
    loadImagesForUpdate($(this).attr('data-url'));
    rePositionPreview();
  })
})

$(function() {
  $('#addNewLink').click(function() {
    openPreview('https://twitter.com')
  })
})

$(function() {
  $('.icon-time').click(function (event) {
    event.stopPropagation();
    $(this).parent().parent().parent().parent().parent().addClass('flip');
    if (!Locals.clickedTimeIcon) {
      $.ajax({
          type: 'GET'
        , url: '/api/user/clickedTimeIcon'
      }).fail(function (err, status) {
        console.log("Something went wrong: " + err);
      })
      $('.hint').fadeOut(400);
    }
  })
})

$(function() {
  $('.easterEggToggle').click(function(event) {
    event.preventDefault();
    $(this).parent().parent().parent().parent().parent().removeClass('flip');
  })
})

$(function() {
  $('.overlay').click(function () {
    if (previewIsOpen()) {
      closePreview();
      resetPreview();
    }
  })
})

// form submissions

// way too much shit here. make a function that takes in variables and sets it up like that
$(function() {
  $('#findForm').submit(function(event) {
    event.preventDefault();
    var url = $('#url').val();
    if (!url) {  
      return showError('You must provide a site to start.');
    }
    $(this).find('#find').disabled = true;
    $(this).find('.loading').show();
    if (!primary.test(url)) {
      url = "http://" + url;
      $('#url').val(url);
    }
    $.ajax({
        type: 'GET'
      , url: '/api/scrape?url=' + url
    }).done(function (data) {
      $('#findForm').find('#find').disabled = false;
      $('#findForm').find('.loading').hide();
      setPreview(url, data.title, '', '', '');
      advancePreview();
      initializeImageOptions(data.images);
      rePositionPreview();
    }).fail(function (err, status) {
      $('#findForm').find('#find').disabled = false;
      $('#findForm').find('.loading').hide();
      showError(err.responseText);
    })
  })
})

$(function() {
  $('#pinForm').submit(function(event) {
    event.preventDefault();
    var url = $('#pinForm #url').val();
    var title = $('#pinForm #title').val();
    var tags = $('#pinForm #tags').val();
    var image = $('#pinForm #image').val();
    var note = $('#pinForm #note').val();
    if (!url || !title) {
      showError('You need a url and a title.', true)
    } else {
      $.ajax({
          type: 'POST'
        , url: '/home/pin'
        , data: {
              url: url
            , title: title
            , tags: tags
            , image: image
            , note: note
          }
      }).done(function () {
        window.location = '/home';
      }).fail(function(err, status) {
        showError(err.responseText, true);
      })
    }
  })
})

// document wide functions

// fix the inside. better code in general i guess. might be fine
$(document).ready(function() {
  reloadMasonry(true);
})

// find a way to make the input function toggle as well. seriously.
$(document).bind('keydown', 'meta+i', function (event) {
  event.preventDefault();
  if (previewIsOpen()) {
    closePreview();
    resetPreview();
  } else {
    openPreview();
  }
});

$(window).resize(function() {
  if (window.innerWidth < 750 && setWidth === 'full') {
    console.log('DECREASING masonry at width ' + window.innerWidth + " and size " + setWidth);
    setWidth = 'small';
    reloadMasonry();
  } else if (window.innerWidth > 750 && setWidth === 'small') {
    console.log('INCREASING masonry at width ' + window.innerWidth + " and size " + setWidth);
    setWidth = 'full';
    reloadMasonry();
  }
})

// other functions

var reloadMasonry = function (withEffect) {
  $('.flip-container').removeClass('ready');
  setTimeout(function() {
    var $container = $('.links');

    $container.imagesLoaded( function() {

      // first go through and do shit to the item selectors
      $('.linkBox').each(function() {
        var height = $(this).height();
        $(this).parent().parent().height(height);
        $(this).parent().find('.backside').height(height);
      });

      $container.masonry({
          itemSelector: '.flip-container'
        , columnWidth: 315
        , gutter: 15
      });

      $('.holder').fadeOut(200);
      //$('.links').css('visibility', 'visible');
      setTimeout(function () {
        $('.flip-container').each(function() {
          $(this).addClass('ready');
          //setTimeout(loadSocial, 300);
        });

        if (!$('.flip-container').length) {
          $('.noLinks').addClass('ready');
        } else {
          if (!Locals.clickedTimeIcon) {
            $('.hint').fadeIn(400);
          }
        }
      }, 100)
    });
  }, 200);
}

var loadSocial = function () {
  $.getScript('/js/social.js', function() {});
};

var loadImagesForUpdate = function (url) {
  $('.imageOptions').html("<p>Fetching images to choose</p>");
  $.ajax({
      type: 'GET'
    , url: '/api/scrape/images?url='+url
  }).done(function(data) {
    initializeImageOptions(data.images);
  })
}

var previewIsOpen = function () {
  return $('.pin:visible').length > 0;
}

var openPreview = function (url, auto) {
  $('.pin').show();
  $('.overlay').addClass('active');
  $('body, html').addClass('disabled');
  $('.formContainer .find input').focus();
  $('.formContainer .find input').val(url || '');
  if (auto) $('.formContainer').submit();
}

var closePreview = function () {
  $('.pin').hide();
  $('.overlay').removeClass('active');
  $('body, html').removeClass('disabled');
}

var setPreview = function (url, title, note, tags, image) {
  //alert('setting preivew with ' + url + ', ' + title);
  $('#pinForm #url').val(url);
  $('#pinForm #title').val(title);
  $('#pinForm #note').val(note);
  $('#pinForm #tags').val(tags);
  $('#pinForm #image').val(image || '');
  $('.previewBox .picture').html(image ? '<img src=\'' + image + '\'>' : '');
  rePositionPreview();
}

var setPreviewImage = function (image) {
  $('#pinForm #image').val(image);
  $('.previewBox .picture').html(image ? '<img src=\'' + image + '\'>' : '');
  rePositionPreview();
}

var resetPreview = function () {
  setPreview('','','','','');
  $('.formContainer .errors').html("");
  $('.formContainer .find').show();
  $('.formContainer .tagAndSave').hide();
  $('.formContainer').css('background-color', '#f8f8f8');
  $('.formContainer .imageOptions').html("");
}

var advancePreview = function () {
  $('.formContainer .find').hide();
  $('.formContainer .tagAndSave').show();
  $('.formContainer').css('background-color', 'rgba(1,1,1,0)');
  $('.formContainer #note').focus();
  $('.formContainer .errors').html("");
}

var rePositionPreview = function () {
  var height = $('.previewBox').height() / 2;
  $('.previewBox').css('top', 'calc(50% - ' + height + 'px)');
}

var initializeImageOptions = function (images) {
  var imagesFound = 0;
  var j = 0;
  var html = "";
  $('.imageOptions').html("");
  images.forEach(function(src, i) {
    var width, height;
    $("<img/>")
      .attr('src', src)
      .load(function (i) {
        j++;
        if (this.width >= 295) {
          html += "<img src='" + src + "' class='selectable' onclick='refresh(this)' />";
          imagesFound+=1;
        }
        if ((j === images.length)) {
          if (!imagesFound) {
            $('.imageOptions').append("<p>No good images were found on this page :(</p>");
          } else {
            $('.imageOptions').append("<p>Choose an image for your beautiful bookmark!</p>");
            $('.imageOptions').append("<a href='javascript:refreshImages();' id='noImages'>Or choose no images</a>");
            $('.imageOptions').append(html);
          }
        }
      });
  })
  if (!images || !images.length) {
    $('.imageOptions').append("<p>No good images were found on this page :(</p>");
  }
}

var refresh = function (el) {
  var elems = document.getElementsByClassName('selectable');
  for (var i = 0; i < elems.length; i++) {
    elems[i].className = 'selectable';
  }
  el.className = el.className + ' active';
  $('#pinForm #image').val(el.getAttribute('src'));
  $('.previewBox .picture').html("<img src='"+el.getAttribute('src')+"'>");
  rePositionPreview();
}

var refreshImages = function () {
  $('.selectable.active').removeClass('active');
  $('#pinForm #image').val("");
  $('.previewBox .picture').html("");
  rePositionPreview();
}

var showError = function (err, showAlert) {
  if (showAlert) {
    alert(err);
  } else {
    $('.errors').html("<font color='red'>" + err + "</font>");
  }
}
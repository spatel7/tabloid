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
    pinNew();
  });
})

$(function() {
  $('.icon-time').click(function (event) {
    event.stopPropagation();
    var r = confirm("Are you sure you want to delete this bookmark?");
    if (r == true) {
      window.location = $(this).parent().parent().find('#deleteLinkBounce').val();
    }
  })
})

$(function() {
  $('.icon-world-2').click(function (event) {
    event.stopPropagation();
    $(this).parent().parent().parent().parent().parent().toggleClass('flip');
  })
})

$(function() {
  $('.easterEggToggle').click(function(event) {
    event.preventDefault();
    $(this).parent().parent().parent().parent().parent().toggleClass('flip');
  })
})

$(function() {
  $('.overlay').click(function () {
    if ($('.pin:visible').length) {
      pinNew();
    }
  })
})

// form submissions

$(function() {
  $('#findForm').submit(function(event) {
    event.preventDefault();
    $(this).find('#find').disabled = true;
    $(this).find('.loading').show();
    var url = $('#url').val();
    $.ajax({
        type: 'GET'
      , url: '/api/scrape?url=' + url
    }).done(function (data) {
      $('#findForm').find('#find').disabled = false;
      $('#findForm').find('.loading').hide();
      $('.formContainer .tagAndSave').find('#url').val(""+url);
      if (!data.title) {
        $('.formContainer .tagAndSave').find('#title').attr('type', 'text');
        $('.formContainer .tagAndSave').find('#title').attr('placeholder', 'title (couldnt find one, sorry!)');
        $('.formContainer .tagAndSave').find('#title').val("");
        $('.formContainer .tagAndSave').find('#title').after('<br>');
      } else {
        $('.formContainer .tagAndSave').find('#title').val(""+data.title);
      }
      $('.formContainer .tagAndSave .titleBox .placeholder').html(data.title);
      $('.formContainer .find').hide();
      $('.formContainer .tagAndSave').show();
      $('.formContainer .tagAndSave').find('#tags').focus();
      $('.formContainer').css('background-color', 'rgba(1,1,1,0)');
      $('.errors').html("");
      var found = false;
      var imagesFound = 0;
      var j = 0;
      data.images.forEach(function(src, i) {
        var width, height;
        $("<img/>")
          .attr('src', src)
          .load(function (i) {
            j++;
            if (this.width >= 295) {
              if (!found) {
                $('.imageOptions').append("<p>Choose an image for your beautiful bookmark!</p>");
                $('.imageOptions').append("<img src='" + src + "' class='selectable active' onclick='refresh(this)' />");
                $('#pinForm #image').val(src);
              } else {
                $('.imageOptions').append("<img src='" + src + "' class='selectable' onclick='refresh(this)' />");
              }
              found = true;
              imagesFound+=1;
            }
            if ((j === data.images.length) && !imagesFound) {
              $('.imageOptions').append("<p>No good images were found on this page :(</p>");
            }
          });
      })
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
    var url = $('#url').val();
    var title = $('#title').val();
    var tags = $('#tags').val();
    var image = $('#image').val();
    if (!url || !title) {
      showError('You need a url and a title.')
    } else if (!tags) {
      showError('You need at least one tag.')
    } else {
      $.ajax({
          type: 'POST'
        , url: '/home/pin'
        , data: {
              url: url
            , title: title
            , tags: tags
            , image: image
          }
      }).done(function () {
        window.location = '/home';
      }).fail(function(err, status) {
        showError(err.responseText);
      })
    }
  })
})

// document wide functions

$(document).ready(function() {
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
        })
      }, 100)
    });
  }, 200);
})

$(document).bind('keydown', 'meta+i', function (event) {
  event.preventDefault();
  pinNew();
});

// other functions

var pinNew = function() {
  if (('.pin:visible').length) {
    renew();
  }
  $('.pin').toggle();
  $('.overlay').toggleClass('active');
  $('.formContainer .find').find('input').focus();
  $('body, html').toggleClass('disabled');
}

var renew = function () {
  $('#pinForm').find('#url').val("");
  $('#pinForm').find('#title').val("");
  $('#pinForm').find('#title').css('type', 'hidden');
  $('#pinForm').find('#image').val("");
  $('#pinForm').find('#tags').val("");
  $('#pinForm .titleBox .placeholder').html("");
  $('#findForm').find('input').val("");
  $('.formContainer .errors').html("");
  $('.formContainer .imageOptions').html("");
  $('.formContainer .find').show();
  $('.formContainer .tagAndSave').hide();
  $('.formContainer').css('background-color', '#f8f8f8');
}

var refresh = function (el) {
  var elems = document.getElementsByClassName('selectable');
  for (var i = 0; i < elems.length; i++) {
    elems[i].className = 'selectable';
  }
  el.className = el.className + ' active';
  $('#pinForm #image').val(el.getAttribute('src'));
}

var showError = function (err) {
  $('.errors').html("<font color='red'>" + err + "</font>");
}
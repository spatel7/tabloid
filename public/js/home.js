// jQuery event listeners

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
  $('.selectable').click(function () {
    alert('found');
    $(this).addClass('active');
  }) 
})

$(function() {
  $('#pinToggle').click(pinNew);
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

// form submissions

$(function() {
  $('#findForm').submit(function(event) {
    event.preventDefault();
    var url = $('#url').val();
    $.ajax({
        type: 'GET'
      , url: '/api/scrape?url=' + url
    }).done(function (data) {
      $('.formContainer .tagAndSave').find('#url').val(""+url);
      if (!data.title) {
        $('.formContainer .tagAndSave').find('#title').attr('type', 'text');
        $('.formContainer .tagAndSave').find('#title').attr('placeholder', 'title (couldnt find one, sorry!)');
        $('.formContainer .tagAndSave').find('#title').val("");
        $('.formContainer .tagAndSave').find('#title').after('<br>');
      } else {
        $('.formContainer .tagAndSave').find('#title').val(""+data.title);
      }
      $('.formContainer .tagAndSave .title').html(data.title);
      $('.formContainer .find').hide();
      $('.formContainer .tagAndSave').show();
      $('.formContainer .tagAndSave').find('#tags').focus();
      $('.errors').html("");
      var found = false;
      data.images.forEach(function(src, i) {
        var width, height;
        $("<img/>")
          .attr('src', src)
          .load(function () {
            if (this.width >= 295) {
              if (!found) {
                $('.imageOptions').append("<img src='" + src + "' class='selectable active' onclick='refresh(this)' />");
                $('#pinForm #image').val(src);
              } else {
                $('.imageOptions').append("<img src='" + src + "' class='selectable' onclick='refresh(this)' />");
              }
              found = true;
            }
          });
      })
    }).fail(function (err, status) {
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
  $(function(){
    var $container = $('.links');

    $container.imagesLoaded( function() {
      $container.masonry({
          itemSelector: '.linkBox'
        , columnWidth: 315
        , gutter: 15
      });

      $('.holder').hide();
      $('.links').css('visibility', 'visible');
    });
  })
})

$(document).bind('keydown', 'meta+i', function (event) {
  event.preventDefault();
  $('.pin').toggle();
  $('.formContainer .find').find('input').focus();
});

// other functions

var pinNew = function() {
  $('.pin').toggle();
  $('.formContainer .find').find('input').focus();
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
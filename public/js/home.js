var images = [
    'http://gspp.berkeley.edu/assets/img/made/assets/uploads/page/splash-contact-center_500_240_80.jpg'
  , 'http://www.ljic.edu/portals/0/4TpW90eWR62kzuE3887J_New-York-City.jpg'
  , 'http://upload.wikimedia.org/wikipedia/commons/4/44/Orleans.bourbon.arp.750pix.jpg'
  , 'http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/7/26/1406388334967/Israeli-ground-operation--011.jpg'
]

$(function() {
  $('.tagLink').click(function(event){
    //event.preventDefault();
  })
})

$(function() {
  $('.updateLink').click(function() {
    $(this).parent().parent().find('.tagsBox').toggle();
  })
})

$(function() {
  $('.deleteLink').click(function(event) {
    var c = confirm('Are you sure you want to delete this bookmark?');
    if (!c) {
      event.preventDefault();
    }
  })
})

/*$(function() {
  $('.tagLink').hover(function () {
    $(this).parent().parent().find('.title').css('text-decoration', 'none');
  }, function () {
    $(this).parent().parent().find('.title').css('text-decoration', 'underline')
  })
})

$(function() {
  $('.linkBox').hover(function() {
    $(this).find('li.title').css('text-decoration', 'underline')
  }, function () {
    $(this).find('li.title').css('text-decoration', 'none')
  })
})*/

$(function() {
  $('.link').click(function(event){
    event.stopPropagation();
  })
})

$(function() {
  $('.tagLink').click(function(event){
    event.stopPropagation();
  })
})

$(function() {
  $('.linkBox').click(function() {
    window.open($(this).find('#bounceUrl').val(), '_blank');
  })
})

$(function() {
  $('.titleBox').click(function() {
    //window.open($(this).parent().parent().find('#bounceUrl').val(), '_blank');
  })
})

var pinNew = function() {
  $('.pin').toggle();
  $('.formContainer .find').find('input').focus();
}

$(function() {
  $('#pinToggle').click(pinNew);
})

$(function() {
  $('#findForm').submit(function(event) {
    event.preventDefault();
    var url = $('#url').val();
    $.ajax({
        type: 'GET'
      , url: '/api/scrape?url=' + url
    }).done(function (data) {
      $('.formContainer .tagAndSave').find('#url').val(""+url);
      $('.formContainer .tagAndSave').find('#title').val(""+data.title);
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
  $('.selectable').click(function () {
    alert('found');
    $(this).addClass('active');
  }) 
})

var refresh = function (el) {
  var elems = document.getElementsByClassName('selectable');
  for (var i = 0; i < elems.length; i++) {
    elems[i].className = 'selectable';
  }
  el.className = el.className + ' active';
  $('#pinForm #image').val(el.getAttribute('src'));
}

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

var showError = function (err) {
  $('.errors').html("<font color='red'>" + err + "</font>");
}

$(document).ready(function() {
  $(function(){
    // first vary the heights
    /*($('.picture').each(function() {
      $(this).css('height', function () {
        var newHeight = parseInt(Math.random() * 0);
        $(this).find('img').attr('src', images[parseInt(Math.random() * 3)]);
        $(this).find('img').css('height', newHeight);
        $(this).find('img').css('width', 295);
        $(this).find('img').hide();
        return newHeight;
      });
    })*/

    /*$('.links').masonry({
        itemSelector: '.linkBox'
      , columnWidth: 315
      , gutter: 15
    })*/

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
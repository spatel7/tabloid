// jQuery

$(function() {
  $('.icon').click(function() {
    $('.login').toggleClass('shown');
    $('.column').toggleClass('shown');
    $('#loginForm #username').focus();
  }) 
})

$(function() {
  $('#loginForm').submit(function(event) {
    event.preventDefault();
    var username = $('#username').val();
    var password = $('#password').val();
    if (!username || !password) {
      alert('You must fill out all fields.');
    } else {
      $.ajax({
          type: 'POST'
        , url: '/login'
        , data: {
            username: username
          , password: password
        }
      }).done(function() {
        window.location = '/home';
      }).fail(function(err, status) {
        alert(err.responseText);
      })
    }
  })
})
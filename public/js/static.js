$(function() {
  $('#loginForm').submit(function(event) {
    event.preventDefault();
    var username = $('#username').val();
    var password = $('#password').val();
    if (!username || !password) {
      showError('You must fill out all fields.');
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
        showError(err.responseText);
      })
    }
  })
})

$(function() {
  $('#registerForm').submit(function(event) {
    event.preventDefault();
    var firstname = $('#firstname').val();
    var lastname = $('#lastname').val();
    var email = $('#email').val();
    var username = $('#username').val();
    var password = $('#password').val();
    var confirm = $('#confirm').val();
    if (!firstname || !lastname || !email || !username || !password || !confirm) {
      showError('You must fill out all fields.');
    } else if (confirm !== password) {
      showError('Passwords do not match.')
    } else {
      $.ajax({
          type: 'POST'
        , url: '/register'
        , data: {
            firstname: firstname
          , lastname: lastname
          , email: email
          , username: username
          , password: password
        }
      }).done(function() {
        window.location = '/home';
      }).fail(function(err, status) {
        showError(err.responseText);
      })
    }
  })
})

$(function() {
  $('#registerForm').submit(function(event) {
    event.preventDefault();
    var firstname = $('#firstname').val();
    var lastname = $('#lastname').val();
    var email = $('#email').val();
    var username = $('#username').val();
    var password = $('#password').val();
    var confirm = $('#confirm').val();
    if (!firstname || !lastname || !email || !username || !password || !confirm) {
      showError('You must fill out all fields.');
    } else if (confirm !== password) {
      showError('Passwords do not match.')
    } else {
      $.ajax({
          type: 'POST'
        , url: '/register'
        , data: {
            firstname: firstname
          , lastname: lastname
          , email: email
          , username: username
          , password: password
        }
      }).done(function() {
        window.location = '/home';
      }).fail(function(err, status) {
        showError(err.responseText);
      })
    }
  })
})

$(function() {
  $('#pinForm').submit(function(event) {
    event.preventDefault();
    var url = $('#url').val();
    var title = $('#title').val();
    var tags = $('#tags').val();
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
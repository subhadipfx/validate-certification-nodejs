
$(document).ready(function(){
    $('.login-info-box').fadeOut();
    $('.login-show').addClass('show-log-panel');

    $('#label-login').click(function (event) {
        const cert_id = $('#cert-id').val();
        const name = $('#student-name').val();
        if(!cert_id || !name){
            event.preventDefault();
            $('#error-message').text("* Please fill all the required fields");
            return;
        }

        $('#valid-result').css('display','none');
        $('#invalid-result').css('display','none');
        axios.post('/api/validate-certification',{
            cert_id,
            name
        })
            .then(response => {
                console.log(response.data)
                if(response.data.status === "SUCCESS"){
                    $('#student-name-label').text(response.data.name);
                    $('#valid-result').css('display','block');
                    $('#invalid-result').css('display','none');
                }else{
                    $('#valid-result').css('display','none');
                    $('#invalid-result').css('display','block');
                }
            })
            .catch(console.log)
    })

    $('#label-register').click(() => {
        $('#cert-id').val('');
       $('#student-name').val('');
        $('#error-message').text('');
    })
});


$('.login-reg-panel input[type="radio"]').on('change', function() {
    if($('#log-login-show').is(':checked')) {
        $('.register-info-box').fadeOut();
        $('.login-info-box').fadeIn();

        $('.white-panel').addClass('right-log');
        $('.register-show').addClass('show-log-panel');
        $('.login-show').removeClass('show-log-panel');

    }
    else if($('#log-reg-show').is(':checked')) {
        $('.register-info-box').fadeIn();
        $('.login-info-box').fadeOut();

        $('.white-panel').removeClass('right-log');

        $('.login-show').addClass('show-log-panel');
        $('.register-show').removeClass('show-log-panel');
    }
});





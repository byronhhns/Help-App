const server = "prod-27.canadacentral.logic.azure.com";
const protocol = "https://";
const url = "https://1b31a042bf50e8b6b04899b15dc0e1.f6.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/3c975ea452b54cb4b4e494013d54aaff/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ucAJDANamPivYyY9nKwylp-Qa4d_u9GOYJEjKVH8vNo";

const questions = "https://1b31a042bf50e8b6b04899b15dc0e1.f6.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/26d3bf70eac44e7f884674572fb901d9/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=QY8a4MOSXQY8Ju26FgfrnGtrdHzJHIc4S5zFSD1vj2A";
const more = "https://1b31a042bf50e8b6b04899b15dc0e1.f6.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/26459101405b4ce185f321b256fb9329/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oIe3GQYbULgQfN2KMUNfiaJbGaNeWuRh0SMrrau50VU";
const code = "https://1b31a042bf50e8b6b04899b15dc0e1.f6.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ef2274e550d74126b7067f694d769801/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=MPVV8YqCn9v_4GwGlkcZvEkL8H39HAgRKZAqr2_phcI";
const auth = "https://1b31a042bf50e8b6b04899b15dc0e1.f6.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ba33daee5e214c48b4619f35e063118e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=HX_8F5ejuVrasufTjd5bQgh7_TW-RGMYtdrdp8gfWas";
const hlpd = "";

async function postData(url, data) {
  // Default options are marked with *
  $("#spinner").show();
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  $("#spinner").hide();
  return response.json(); // parses JSON response into native JavaScript objects
}

function get_auth_code() {
  postData(code, { email: $("#emailAddress").val()}).then(
    (data) => {
      if (data.found == 'True') {
        $("#destination_email_address").text($("#emailAddress").val());
        $("#email_lookup").hide("slide", {direction: "right"}, 20000);
        $("#auth").show();
        $("body").append('<div id="data-email" data-email="'+$("#emailAddress").val()+'">');
      } else {
        $("#emailAddress").val("");
      }
    } 
  ).catch((err) => {
    console.log(err);
  });
}

function authenticate_user(){
  $("#spinner").show();
  postData(auth, { email: $("div[data-email]")[0].dataset['email'], code: $("#token").val()}).then(
    (data) => {
      if (data.error == undefined && data.validated != "Access Denied") {
        $("#auth").hide();
        $("body").append('<div data-session="'+data.validated+'">');
        email_submit();
      }
    }
  ).catch((err) => {
    console.log(err);
  });
}

function email_submit(){
  postData(url, { email: $("div[data-email]")[0].dataset['email'], key:$("div[data-session]")[0].dataset['session'] }).then(
    (data) => {
      if (data.error == undefined) {
        $("#email_lookup").hide("slide", {direction: "right"}, 20000);
        get_questions();
        $("#help_questions").show();
        $("#personnel_name").text(data.crc44_crd8b_contactname);
        $("body").append('<div data-personnelid="'+data.crc44_crd8b_employeenumber+'">');
      }
    }
  ).catch((err) => {
    console.log(err);
  });
}

function answer_click(id){
  postData(questions, { email: $("div[data-email]")[0].dataset['email'], request:"answers", id:id, key:$("div[data-session]")[0].dataset['session'] }).then(
    (data) => {
      if (data.error == undefined && data.validated != "Access Denied") {
        data.answer.forEach( (element) => { add_answer(element)});
        $("div[data-session]")[0].dataset['session'] = data.validated;
      } else {
        $("#answer").append("<div>No asnwer was found for this question.</div>");
        $("div[data-session]")[0].dataset['session'] = data.validated;
      }

    }
  ).catch((err) => {
    $("#answer").append("<div>No asnwer was found for this question.</div>");
    $("div[data-session]")[0].dataset['session'] = data.validated;
  });
  $("#help_questions").hide();
  $("#help_answer").show("slide", {direction: "right"}, 20000);
}


function invite_click(){
  postData(questions, { email: $("div[data-email]")[0].dataset['email'], request:"invite", key:$("div[data-session]")[0].dataset['session'] }).then(
    (data) => {
      if (data.error == undefined && data.validated != "Access Denied") {
        $("#jira_issuekey").append('<div>An invitation to the Personnel Portal was sent to: ' +  $("div[data-email]")[0].dataset['email']);
        $("div[data-session]")[0].dataset['session'] = data.validated;
        $("#help_answer").hide();
        $("#confirmation").show();        
      } else {
        $("#answer").append("<div>An error occured.</div>");
        $("div[data-session]")[0].dataset['session'] = data.validated;
      }

    }
  ).catch((err) => {
    $("#answer").append("<div>Fatal Error.</div>");
    $("div[data-session]")[0].dataset['session'] = data.validated;
  });
}

function get_questions(){
  postData(questions, { email: $("div[data-email]")[0].dataset['email'], request:"questions", key:$("div[data-session]")[0].dataset['session'] }).then(
    (data) => {
      if (data.error == undefined) {
        data.questions.forEach( (element) => { add_question(element)});
        $("div[data-session]")[0].dataset['session'] = data.validated;
      }
    }
  ).catch((err) => {
    console.log(err);
  });
}

function add_question(data){
  $("#my_questions").append('<div class="form-check">' +
        '<input data-answer="'+data.new_questionsid+'" class="form-check-input" type="radio" name="questionRadio" id="'+data.new_questionsid+'" onclick="answer_click(\''+data._new_answer_value+'\')">' +
        '<label class="form-check-label" for="'+data.new_questionsid+'">' + 
        data.new_question+
        '</label>'
  )
}

function add_answer(data){
  $("#answer").empty();
  $("#answer").append('<div data-answer="'+data.new_answersid+'">'+data.new_answer);
  populate($("#answer"));
}

function did_not_help(){
  postData(more, { email: $("div[data-email]")[0].dataset['email'], description:$("#question_not_answered_more_detail").val(), question: $('input[name="questionRadio"]:checked')[0].id, answer :$("div[data-answer]")[0].dataset['answer'] }).then(
    (data) => {
      if (data.error == undefined) {
      $("#jira_issuekey").append('<p>We have created a trouble ticket for you, it is: <a href="https://personnel.portal.helpinghandshealthcare.ca/servicedesk/customer/portal/1/'+data.issuekey+'">'+data.issuekey+'</a>.  Please use this reference number to reference this issue.  You will also receive an email confirmation.</p>');
      $("#more_detail").hide();
      $("#confirmation").show();
      }
    }
  ).catch((err) => {
    console.log(err);
  });  
}

function populate(node) {
    console.log(node.children()['length']);
    index = 0;
    console.log(node[0].id);
    if (node.children()['length'] > 0 )
    {
        console.log("before if "+node[index].id);
        next = node.children();
        populate(next);
    } else {
        console.log("before if in else "+node[index].id);
        if ($("div[data-"+node[index].id+"]")['length']>0){
            console.log("in else in if "  + node[index].id);
            $("#"+node[index].id).text($("div[data-"+node[index].id+"]")[0].dataset[node[index].id]);
        }
        console.log("no children");
    }
}

function that_helped(){
  postData(more, { email: $("div[data-email]")[0].dataset['email'], description:"Auto-resolve", question: $('input[name="questionRadio"]:checked')[0].id, answer :$("div[data-answer]")[0].dataset['answer'] }).then(
    (data) => {
      if (data.error == undefined) {
      $("#jira_issuekey").append('<p>Thank you for your feedback.  We have created a trouble ticket, <a href="https://personnel.portal.helpinghandshealthcare.ca/servicedesk/customer/portal/1/'+data.issuekey+'">'+data.issuekey+'</a>.  that will be automatically resolved.  If you have any further concerns regarding the help that you have received, please use this reference number to reference this ticket number.  You will also receive an email confirmation.</p>');
      $("#more_detail").hide();
      $("#confirmation").show();
      }
    }
  ).catch((err) => {
    console.log(err);
  });  
}
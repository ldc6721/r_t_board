$(document).ready(function(){
  //ready action ( DOM Tree 생성 완료 후)
  $("#board-write-confirm").click(()=> {
    //send post
    var title = $("#board-write-title").val();
    if($.trim(title) == ""){
      alert("제목을 입력해주세요.");
      return ;
    }
    var contents = $("#board-write-contents").val();
    if($.trim(contents) == "") {
      alert("내용을 입력해주세요.");
      return ;
    }
    console.log(title);
    console.log(contents);
    $.ajax({
      //write post ajax
      url:$(location).attr('href'),
      type:"POST",
      dataType:"json",
      contentType:"application/json",
      data:
      JSON.stringify({
        "title" : title,
        "contents": contents
      }),
      success:(res)=>{
        console.log(res);
        window.location.href="./";
        //alert("post is committed");
      },
      error:(req,status,err) => {
        console.log("post error!",req.responseJSON.error);
        alert("post error!");
      }
    });
  });


  //test
  $("#new_comment").click(()=> {
    new_cmt(2,"nickname","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dis parturient montes nascetur ridiculus mus mauris vitae ultricies leo. Nibh nisl condimentum id venenatis. Diam sit amet nisl suscipit. Dolor purus non enim praesent elementum facilisis leo. Quam vulputate dignissim suspendisse in est ante in nibh mauris. Tristique senectus et netus et malesuada fames ac turpis. Tincidunt eget nullam non nisi est. Eu augue ut lectus arcu bibendum at varius vel pharetra. Tincidunt arcu non sodales neque sodales ut. Odio tempor orci dapibus ultrices in iaculis nunc sed augue. Purus in mollis nunc sed. Facilisi morbi tempus iaculis urna id volutpat. Proin fermentum leo vel orci porta non. Enim diam vulputate ut pharetra sit amet aliquam id. Et netus et malesuada fames. Amet nulla facilisi morbi tempus iaculis urna id.","2020-02-02 12:32:42");
    var autoheight = $("#cmt_id_2").height();
    var autowidth = $("#cmt_id_2").width();
    $("#cmt_id_2").css({height:0,width:0});
    $("#cmt_id_2").animate({
      height: autoheight,
      width: autowidth
    },500);
  });
});

function new_cmt(id,nickname,text,date) {
  //append new_cmt
  var $input = document.createElement('li');
  $input.innerHTML =
  `<div id="cmt_id_`+id+`"class="comment-block">
    <div class="comment-nicknameBlock">
      <div class="comment-nicknameBox">
        <p>` + nickname + `</p>
      </div>
    </div>
    <div class="comment-inputtextBlock">
      <div class="comment-inputtextBox">
        <hgroup class="speech-bubble" role="textbox" maxlength="999" spellcheck="false">
          <p>` + text + `</p>
        </hgroup>
      </div>
    </div>
    <div class="comment-dateBlock">
      <div class="comment-dateBox">
        <p>` + date + `</p>
      </div>
    </div>
  </div>`;
  $("#cmt_list").append($input);
}



// $(document).onload(function() {
//   //onload action(모든 페이지 구성요소 페인팅 완료 후)
//
// });
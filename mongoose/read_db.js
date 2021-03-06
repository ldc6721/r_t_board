var db = require("./schema.js");

let get_time = (time)=>{
  //time format redefinition
  var postTime = time.toFormat('YYYY-MM-DD');
  if(time.toFormat('YYYY-MM-DD') === new Date().toFormat('YYYY-MM-DD')){
    postTime = time.toFormat('HH24:MI:SS');
  }
  return postTime;
};

let cnt_update = async (board_name,number,number2) =>{
  //count update in boarddata collection
  //number is amount of post , number2 is amount of activated post(not deleted);
  let boarddata = await db("boarddata","boarddataSchema");
  return await boarddata.findOneAndUpdate({board_name:board_name},{$inc:{postcnt:number,active_post:number2}},{new:true});
};

let get_user_count = async (usercnt) => {
  let iddata = await db("user","userSchema");
  return await iddata.countDocuments({});
};

module.exports = {
  get_post: async (board_name, num, num2) => {
    //get recently post list in 'board_name' range in num and num2
    let board = await db(board_name, "postSchema");
    let post_list;
    try{
      let docs = await board.find({deleted:false},{}, {
        //sort 역방향
        sort: {
          index: -1
        },
        //limit num2 - num
        limit: num2,
        //skip num element
        skip: num
      });
      //범위의 수 보다 작은 경우 check
      var cnt = num2 < docs.length ? num2 : docs.length;
      post_list = new Array(cnt);
      //insert element
      for (var i = 0; i < post_list.length; i++) {
        post_list[i] = {
          index: docs[i].index,
          subject: docs[i].title,
          author: docs[i].author,
          date: get_time(docs[i].date),
          viewcnt: docs[i].viewcnt,
          goodcnt: docs[i].goodcnt
        }
      }
    }
    catch(e){
      console.error(e);
    }
    return post_list;
  },

  get_post_one: async (board_name,index) => {
    //get one post data
    let board = await db(board_name,"postSchema");
    let read_post;
    try {
      let doc = await board.findOne({index:index,deleted:false});
      if(doc)
      {
        read_post = {
          index: doc.index,
          subject: doc.title,
          contents:doc.contents,
          author: doc.author,
          uid:doc.uid,
          date: get_time(doc.date),
          viewcnt: doc.viewcnt,
          goodcnt: doc.goodcnt,
          comment: doc.comment
        };
        return read_post;
      }
    }
    catch(e) {
      console.error(e);
      return;
    }
  },

  view_good_call: async(board_name,index,view_call,good_call)=>{
    try {
      let board = await db(board_name,"postSchema");
      //post good call
      let view_cnt = 0;
      if(view_call){
        view_cnt = 1;
      };
      let good_cnt = 0;
      if(good_call){
        good_cnt = 1;
      }
      board.updateOne({index:index},{$inc:{viewcnt:view_cnt,goodcnt:good_cnt}},(err,res)=>{
        if(err){
          return console.error(err);
        }
      });
    } catch (e) {
      console.error(e);
    }
  },

  create_new_board: async(board_name) => {
    let boarddata = await db("boarddata","boarddataSchema");
    boarddata.create({
      board_name:board_name
    },(err,user) => {
      if(err) {
        console.error("board create fail",err);
      }
    });
    //board setting
    //db(0,0,true);
    return ;
  },

  create_new_post: async (board_name,title,contents,author,uid,time) => {
    let board = await db(board_name, "postSchema");
    board.create({
      index: (await cnt_update(board_name,1,1)).postcnt,
      title: title,
      contents: contents,
      author: author,
      uid:uid,
      date: time
    }, (err, user) => {
      if (err) {
        console.error("create fail", err);
      }
      try{
        console.log("success!");
      }
      catch(e) {
        console.error(e);
      }
    });
  },

  modify_post: async (board_name,index,title,contents) =>{
    let board = await db(board_name, "postSchema");
    board.updateOne({index:index},{title:title,contents:contents},(err,res)=>{
      if(err){
        console.error(err);
      }
    });
  },

  create_new_comment: async (board_name,index,nickname,uid,contents,time)=>{
    let board = await db(board_name, "postSchema");
    let doc = await board.findOne({index:index});
    if(!doc) {
      console.log("create comment fail!",board_name,index,nickname,contents,time);
      return console.log("find one error!", err);
    };
    doc.comment.push({
      nickname: nickname,
      uid:uid,
      comment: contents,
      date: time
    });
    doc.save();
    return doc.comment.length - 1;
  },

  delete_one_post: async (board_name,index) => {
    let board = await db(board_name, "postSchema");
    board.updateOne({index: index},{deleted:true},(err,res)=>{
      if(err){
        console.log("post deleted error!",board_name,index);
        return console.error(err);
      }
    });
    cnt_update(board_name,0,-1);
  },

  delete_one_comment: async (board_name,index,cmt_index,uid) => {
    let board = await db(board_name, "postSchema");
    let cmt_idx = cmt_index.split('_')[2];
    // board.updateOne({index:index,"comment.$":cmt_idx},{"comment.$.deleted":true},(err,res)=>{
    //   if(err){
    //     return console.error(err);
    //   }
    // });
    let doc = await board.findOne({index:index});
    if(doc.uid === uid) {
      doc.comment[cmt_idx].deleted = true;
      doc.save();
      return true;
    }
    else {
      return false;
    }
  },

  get_board_cnt: async (board_name) =>{
    let boarddata = await db("boarddata","boarddataSchema");
    let doc = await boarddata.findOne({board_name:board_name},{_id:false,postcnt:true});
    if(doc){
      return doc.postcnt;
    }
    return ;
  },

  get_board_data: async (board_name) =>{
    if(board_name) {
      //board_name document data
      let boarddata = await db("boarddata","boarddataSchema");
      let doc = await boarddata.findOne({board_name:board_name});
      return doc;
    }
    else {
      //all data
      let boarddata = await db("boarddata","boarddataSchema");
      let doc = await boarddata.find({});
      return doc;
    }
  },

  //login_part
  get_login_data: async (id) => {
    let model = await db("user","userSchema");
    return await model.findOne({userid:id});
  },
  create_login_data: async (id,ps,psbuf)=>{
    let model = await db("user","userSchema");
    model.create({
      uid:await get_user_count(),
      userid: id,
      userps: ps,
      userpsbuf: psbuf
    },(err)=>{
      if(err){
        return console.log(err);
      }
    });
  },
  get_session_data: async(session_id) => {
    let model = await db("sessions","sessionSchema");
    return await model.findOne({_id:session_id});
  }
}

$(document).ready(function(){

  var bg_move_1 = 0;
  var splash_background = setInterval(function(){
    bg_move_1++;
    var position = "-"+bg_move_1+"px 0;";
    $("#splash_screen").attr("style","background-position: "+position);
  },50);

  var top_score = +localStorage.getItem("top_score");

  if(top_score == null){
    $(".top_score").hide();
  }else{
    if(top_score > 0){
      $(".top_score").html("Your Highscore: <strong>"+top_score+"</strong>").slideDown();
    }else{
      $(".top_score").hide();
    }
  }

  //$("#bg_music")[0].play();

  $("#splash_screen img").fadeIn(function(){
    $("#start_game").slideDown();
    $(".zed_developers").slideDown();
  });

  var myGamePiece;
  var myObstacles = [];
  var myScore;
  var background;

  var game_score = 0;

  var life = 3;

  function startGame() {
      myGamePiece = new component(40, 40, "img/bird1.gif", 10, 120, "image");
      myGamePiece.gravity = 0.01;
      myScore = new component("20px", "Consolas", "red", 5, 20, "text");
      hit = new sound("audio/hit.wav");
      gameover = new sound("audio/gameover.wav");
      myGameArea.start();

      var bg_move = 0;
      background = setInterval(function(){
        bg_move++;
        var position = "-"+bg_move+"px 0;";
        $("canvas").attr("style","background-position: "+position);
      },50);

      setTimeout(function(){
        $("#bg_music")[0].play();
      },1000);

      $(".lives").fadeIn();
      $(".zed_developers").slideUp();
      clearInterval(splash_background);
  }

  var myGameArea = {
      canvas : document.createElement("canvas"),
      start : function() {
          this.canvas.width = $(window).width();
          this.canvas.height = $(window).height();
          this.context = this.canvas.getContext("2d");
          document.body.insertBefore(this.canvas, document.body.childNodes[0]);
          this.frameNo = 0;
          this.interval = setInterval(updateGameArea, 10);
          },
      clear : function() {
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      },
      stop : function() {
          clearInterval(this.interval);

          $("#bg_music")[0].pause();
          setTimeout(function(){
            gameover.play();
            clearInterval(background);

            var top_score   = localStorage.getItem("top_score");

            //save top score
            if(top_score == null){
              localStorage.setItem("top_score",game_score);
            }else{
              if(game_score > top_score){
                localStorage.setItem("top_score",game_score);
              }
            }

            setTimeout(function(){
              window.location.replace("index.html");
            },1000);

          },500);

          //bg_music.stop();

      }
  }



  function component(width, height, color, x, y, type) {
      this.type = type;
      if (type == "image") {
          this.image = new Image();
          this.image.src = color;
      }
      this.score = 0;
      this.width = width;
      this.height = height;
      this.speedX = 0;
      this.speedY = 0;
      this.x = x;
      this.y = y;
      this.gravity = 0;
      this.gravitySpeed = 0;
      this.update = function() {
          ctx = myGameArea.context;
          if (this.type == "text") {
           ctx.font = this.width + " " + this.height;
           ctx.fillStyle = color;
           ctx.fillText(this.text, this.x, this.y);
         }
          if (type == "image") {
              ctx.drawImage(this.image,
                  this.x,
                  this.y,
                  this.width, this.height);

        }         else {
              ctx.fillStyle = color;
              ctx.fillRect(this.x, this.y, this.width, this.height);
          }
      }
      this.newPos = function() {
          this.gravitySpeed += this.gravity;
          this.x += this.speedX;
          this.y += this.speedY + this.gravitySpeed;
          this.hitBottom();
      }
      this.hitBottom = function() {
          var rockbottom = myGameArea.canvas.height - this.height;
          if (this.y > rockbottom) {
              this.y = rockbottom;
              this.gravitySpeed = 0;
          }
      }
      this.crashWith = function(otherobj) {
          var myleft = this.x;
          var myright = this.x + (this.width);
          var mytop = this.y;
          var mybottom = this.y + (this.height);
          var otherleft = otherobj.x;
          var otherright = otherobj.x + (otherobj.width);
          var othertop = otherobj.y;
          var otherbottom = otherobj.y + (otherobj.height);
          var crash = true;
          if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
              crash = false;
          }
          return crash;
      }
  }

  var last_hit  = 0;
  function updateGameArea() {
      var x, height, gap, minHeight, maxHeight, minGap, maxGap;
      for (i = 0; i < myObstacles.length; i += 1) {
          if (myGamePiece.crashWith(myObstacles[i])) {
            var new_hit   = new Date().getTime();
            if(new_hit-last_hit > 500){
              hit.play();
              $(".life_"+life).attr("src","img/life-cancel.png");
              life--;

              //navigator.vibrate(200);

              if(life == 0){
                myGameArea.stop();
                return;
              }
            }
            last_hit = new_hit;
          }
      }
      myGameArea.clear();
      myGameArea.frameNo += 1;
      if (myGameArea.frameNo == 1 || everyinterval(200)) {
          x = myGameArea.canvas.width;
          minHeight = 0; //top bar
          maxHeight = $(window).height()/2;
          height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);

          minGap = 75; //door min
          maxGap = ($(window).height()/2)+10; //door max
          gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);

          myObstacles.push(new component(10, height, "black", x, 0));
          myObstacles.push(new component(10, x - height - gap, "black", x, height + gap));
      }
      for (i = 0; i < myObstacles.length; i += 1) {
          myObstacles[i].x += -1;
          myObstacles[i].update();
      }

      game_score  = Math.ceil(myGameArea.frameNo/50);

      myScore.text="SCORE: " + game_score;
      myScore.update();
      myGamePiece.newPos();
      myGamePiece.update();
  }

  function sound(src) {
      this.sound = document.createElement("audio");
      this.sound.src = src;
      this.sound.setAttribute("preload", "auto");
      this.sound.setAttribute("controls", "none");
      this.sound.style.display = "none";
      document.body.appendChild(this.sound);
      this.play = function(){
          this.sound.play();
      }

      //this.stop = function(){
          //this.sound.pause();
      //}
  }

  function move(dir) {
      myGamePiece.image.src = "img/bird1.gif";
      if (dir == "up") {myGamePiece.speedY = -1; }
      if (dir == "down") {myGamePiece.speedY = 1; }
      if (dir == "left") {myGamePiece.speedX = -1; }
      if (dir == "right") {myGamePiece.speedX = 1; }
  }

  function bird_image(path) {
      myGamePiece.image.src = path;
      myGamePiece.speedX = 0;
      myGamePiece.speedY = 0;
  }

  function everyinterval(n) {
      if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
      return false;
  }

  function accelerate(n) {
      myGamePiece.gravity = n;
  }

  $("#start_game").click(function(){
      $("#splash_screen").slideUp();
      startGame();
  })


  $(document).delegate("canvas","click",function(){

    if(myGamePiece.y > 20){
      accelerate(-0.05);
      bird_image("img/bird2.gif");

      //play sound
      var jump = document.createElement("audio");
      jump.src = "audio/jump.wav";
      jump.setAttribute("preload", "auto");
      jump.setAttribute("controls", "none");
      jump.style.display = "none";
      document.body.appendChild(jump);
      jump.play();
      //play sound end

      setTimeout(function(){
        accelerate(0.02);
        bird_image("img/bird1.gif");
      },100);
    }



  });



});



/*
var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        StatusBar.hide();
    },
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};
app.initialize();
*/

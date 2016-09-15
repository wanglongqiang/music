$(window).load(function(){
	loadBG();
	//fPlay();
});

/*定义一些常用变量*/
/*显示歌词部分*/
var scrollt=0; var tflag=0;//存放时间和歌词的数组的下标
var lytext=new Array();//放存汉字的歌词 
var lytime=new Array();//存放时间
var delay=10; var line=0; var scrollh=0; 
var songIndex=1;
var count = 0; //记录歌曲数目
var model;
$(function(){
	//播放列表持久化文件，通过读取该文件，然后再用knockout绑定数据至html页面
	/*var fs = require('fs');
	var path = require('path');
	fs.readFile('../songlist.txt', {flag: 'r+', encoding: 'utf8'}, function (err, data) {
		  if(err) {
            console.error(err);
              return;
            }
        console.log(data);
      });*/
	model = {modelContent:ko.observableArray([])};// ko需绑定的数据模型
	model.modelContent.push({path : 'songs/爱在西元前.mp3',
							 id: ++count,
							 songName: '爱在西元前',
							 songer: '周杰伦',
							 album: '范特西'});
	model.modelContent.push({path : 'songs/背叛.mp3',
							 id: ++count,
							 songName: '背叛',
							 songer: '曹格',
							 album: '齐天大圣'});
	model.modelContent.push({path : 'songs/何必在一起.mp3',
							 id: ++count,
							 songName: '何必在一起',
							 songer: '张杰',
							 album: '我叫闰土'});
	model.modelContent.push({path : 'songs/听妈妈的话.mp3',
							 id: ++count,
							 songName: '听妈妈的话',
							 songer: '周杰伦',
							 album: '叶惠美'});
	model.modelContent.push({path : 'songs/想你的夜.mp3',
							 id: ++count,
							 songName: '想你的夜',
							 songer: '关喆',
							 album: '天天想你'});
	model.modelContent.push({path : 'songs/夜曲.mp3',
							 id: ++count,
							 songName: '夜曲',
							 songer: '周杰伦',
							 album: '七里香'});
	ko.applyBindings(model, $(".songUL")[0])	
	
	/*歌曲列表效果*/
	$(".songList").hover(function(){
		$(this).find(".more").show();
		$(this).find(".dele").show();
	},function(){
		$(this).find(".more").hide();
		$(this).find(".dele").hide();
	});
	/*自定义滚动条*/
	$(".songUL").rollbar({zIndex:80});
	/*复选框*/
	$(".checkIn").click(function(){
		var s=$(this).attr("select");
		if (s==0) {
			$(this).css("background-position","-37px -710px");
			$(this).attr("select","1");
		};
		if (s==1) {
			$(this).css("background-position","");
			$(this).attr("select","0");
		};		
	});
	$(".checkAll").click(function(){
		var s=$(this).attr("select");
		if (s==0) {
			$(this).css("background-position","-37px -710px");
			$(".checkIn[select='0']").css("background-position","-37px -710px");
			$(".checkIn[select='0']").attr("select","1");
			$(this).attr("select","1");
		};
		if (s==1) {
			$(this).css("background-position","");
			$(".checkIn[select='1']").css("background-position","");
			$(".checkIn[select='1']").attr("select","0");
			$(this).attr("select","0");
		};
	});
	/*点击列表播放按钮*/
	$(".songUL em").click(function(){
		/*开始放歌*/
		var sid=$(this).attr("songPath");
		var index=$(this).attr("sonN");
		songIndex=index;
		$("#audio").attr("src",sid);	
		audio=document.getElementById("audio");//获得音频元素
		/*显示歌曲总长度*/
		if(audio.paused){
			audio.play();
		} 				
		else
			audio.pause();	
		audio.addEventListener('timeupdate',updateProgress,false);
		
		audio.addEventListener('play',audioPlay,false);
		audio.addEventListener('pause',audioPause,false);
		audio.addEventListener('ended',audioEnded,false);
	
		/*底部显示歌曲信息*/
		var songName=$(this).parent().parent().find(".colsn").html();
		var singerName =$(this).parent().parent().find(".colcn").html();
		/*播放歌词*/
		getReady(songName);//准备播放
		mPlay();//显示歌词
		//对audio元素监听pause事件
		/*外观改变*/
		var html="";
		html+='<div class="manyou">';
		html+='	<a href="#" class="manyouA">相似歌曲</a>';
		html+='</div>';
		$(".start em").css({
			"background":"",
			"color":""
		});
		$("#canvas1").css({'display':'inline'});
		$(".manyou").remove();
		$(".songList").css("background-color","#f5f5f5");
		$(this).css({
			"background":'url("css/images/play.gif") no-repeat',
			"color":"transparent"
		});
		$(this).parent().parent().parent().append(html);
		$(this).parent().parent().parent().css("background-color","#E0D3D3");

		
		$(".songName").html(songName);
		$(".songPlayer").html(singerName);
		$(".songName").parent().attr('songID', songIndex);
		/*换右侧图片*/
		$("#canvas1").attr("src",'images/'+songName+'.jpg');
		$("#canvas1").load(function(){
			loadBG();
		});

		$(".blur").css("opacity","0");
		$(".blur").animate({opacity:"1"},1000);
	});
	/*双击播放*/
	$(".songList").dblclick(function(){
		var sid = $(this).find(".start em").html();
		$(".start em[sonN="+sid+"]").click();
	});
	/*底部进度条控制*/
	$( ".dian" ).draggable({ 
		containment:".pro2",
		drag: function() {
			var length = $(".pro2")[0].clientWidth;
			var l=$(".dian").css("left");
			var le = parseInt(l);
			audio.currentTime = audio.duration*(le/length);
      	}
	});
	/*音量控制*/
	$( ".dian2" ).draggable({ 
		containment:".volControl",
		drag: function() {
			var l=$(".dian2").css("left");
			var le = parseInt(l);
			audio.volume=(le/80);
      }
	});
	/*底部播放按钮*/
	$(".playBtn").click(function(){
		//如果播放歌曲停止，再次点击播放按钮还是播放此歌曲
		var songID = $('.trackInfo').attr('songID');
		if(songID == undefined){
			// 如果上来点击播放按钮 return
			return;
		}else{
			// 如果停止后播放
			if(0 == audio.currentTime){
				$(".start em[sonN="+songID+"]").click();
				return;
			}
			var p = $(this).attr("isplay");		
			if (p==0) {
				$(this).css("background-position","0 -30px");
				$(this).attr("isplay","1");
			};
			if (p==1) {
				$(this).css("background-position","");
				$(this).attr("isplay","0");
			};
			if(audio.paused) 
				audio.play();
			else
				audio.pause();
		}
	});
	/*底部停止按钮*/
	$(".stop").click(function(){
		$(".start em").css({
			"background":"",
			"color":""
		});
		$(".manyou").remove();
		$(".songList").css("background-color","#f5f5f5");
		audio=document.getElementById("audio");//获得音频元素
		$(".playBtn").css("background-position","");
		$(".playBtn").attr("isplay","0");		
		audio.pause();
		audio.currentTime = 0;
	});
	/*模式选择*/
	$(".mode").click(function(){
		// model 0为列表循环播放, 1为单曲循环, 2为随机播放
		var mode = $(this).attr('playMode');
		if('0' == mode){
			$(this).attr('playMode', '1');
			$(this).css('background-position','0 -200px')
		}else{
			if('1' == mode){
				$(this).attr('playMode', '2');
				$(this).css('background-position','0 -219px')
			}else{
				$(this).attr('playMode', '0');
				$(this).css('background-position','0 -181px')
			}
		}
	});
	/*上一首*/
	$(".prevBtn").click(function(){
		//切歌曲时首先要看一下当前的播放模式
		var mode = $(".mode").attr('playMode');
		// 初始化sid
		var sid = 0;
		// 此时歌曲播放模式为随机模式
		if('2' == mode){
			var random = Math.random();
			sid = Math.round(random*count);
		}else{
			//此时歌曲播放模式为单曲循环,顺序播放
			sid = parseInt(songIndex)-1;
			// 当第一首歌向上切歌时
			if(0 == sid){
				sid = count;
			}
		}
		$(".start em[sonN="+sid+"]").click();
	});
	/*下一首*/
	$(".nextBtn").click(function(){
		//切歌曲时首先要看一下当前的播放模式
		var mode = $(".mode").attr('playMode');
		// 初始化sid
		var sid = 0;
		// 此时歌曲播放模式为随机模式
		if('2' == mode){
			var random = Math.random();
			sid = Math.round(random*count);
		}else{
			//此时歌曲播放模式为单曲循环,顺序播放
			sid = parseInt(songIndex)+1;
			// 当第一首歌向下切歌时
			if(sid > count){
				sid = 1;
			}
		}
		$(".start em[sonN="+sid+"]").click();
	});
});

/*根据所选歌曲淡化播放器的首尾background效果,类似酷我音乐盒*/
function loadBG(){
	var c=document.getElementById("canvas");
	var ctx=c.getContext("2d");
	var img=document.getElementById("canvas1");
	ctx.drawImage(img,45,45,139,115,0,0,1366,700);//设置背景图片
	stackBlurCanvasRGBA('canvas',0,0,1366,700,60);//模糊化背景图片
}

function calcTime(time){
	var hour;         	var minute;    	var second;
	hour = String ( parseInt ( time / 3600 , 10 ));
	if (hour.length ==1 )   hour='0'+hour;
	minute=String(parseInt((time%3600)/60,10));
	if(minute.length==1) minute='0'+minute;
	second=String(parseInt(time%60,10));
	if(second.length==1)second='0'+second;
	return minute+":"+second;
}
function updateProgress(ev){
	/*显示歌曲总长度*/
	var songTime = calcTime(Math.floor(audio.duration));
	$(".duration").html(songTime);
	/*显示歌曲当前时间*/
	var curTime = calcTime(Math.floor(audio.currentTime));
	$(".position").html(curTime);
	/*进度条*/
	var length = $(".pro2")[0].clientWidth;
	var lef = length*(Math.floor(audio.currentTime)/Math.floor(audio.duration));
	var llef = Math.floor(lef).toString()+"px";
	$(".dian").css("left",llef);
}
function audioPlay(ev){
	$(".iplay").css("background",'url("css/images/whitePlay.gif") 0 0');
	$(".playBtn").css("background-position","0 -30px");
	$(".playBtn").attr("isplay","1");
}
function audioPause(ev){
	$(".iplay").css("background","");
}
function audioEnded(ev){
	//歌曲结束时要看当前的播放模式
		var mode = $(".mode").attr('playMode');
		// 初始化sid
		var sid = 0;
		// 此时歌曲播放模式为随机模式
		if('2' == mode){
			var random = Math.random();
			sid = Math.round(random*count);
		}else{
			// 此时歌曲播放模式为单曲循环
			if('1' == mode){
				sid = parseInt(songIndex);
			}else{//此时歌曲播放模式为顺序播放
				sid = parseInt(songIndex)+1;
				if(sid > count){
					sid = 1;
				}
			}
		}
	$(".start em[sonN="+sid+"]").click();
}
//核心模块文件读取写入出了一点问题,后续这些歌词，歌曲列表都要持久化到文件中
function getLy(s)
{ 	
	var ly="";
	if (s=="爱在西元前") {
		ly="[00:03]歌曲名：爱在西元前(丑女大翻身片头曲).[00:07] 词：方文山 曲：周杰伦.[00:31]古巴比伦王颁布了汉摩拉比法典.[00:34]刻在黑色的玄武岩 距今已经三千七百多年.[00:38]你在橱窗前 凝视碑文的字眼.[00:42]我却在旁静静欣赏你那张我深爱的脸.[01:51][00:46]祭司 神殿 征战 弓箭 是谁的从前.[01:55][00:50]喜欢在人潮中你只属于我的那画面.[01:58][00:54]经过苏美女神身边 我以女神之名许愿.[02:03][00:58]思念像底格里斯河般的漫延.[02:07][01:02]当古文明只剩下难解的语言.[02:13][01:08]传说就成了永垂不朽的诗篇. [03:07][02:22][01:17]我给你的爱写在西元前 深埋在美索不达米亚平原.[03:15][02:29][01:25]几十个世纪后出土发现 泥板上的字迹依然清晰可见. [03:22][02:37][01:32]我给你的爱写在西元前 深埋在美索不达米亚平原.[03:30][02:44][01:40]用楔形文字刻下了永远 那已风化千年的誓言.[03:36][02:50][01:46]一切又重演 .[02:52]我感到很疲倦离家乡还是很远.[02:58]害怕再也不能回到你身边. [03:39]爱在西元前 爱在西元前."
	} else{
		/*if (s=="听妈妈的话"){
			ly="[00:09]小朋友你是否有很多顽抗.[00:12]为什么别人在那看漫画.[00:15]我却在学画画.[00:16]对这钢琴说话别人在玩游戏.[00:18]我却在躲在家背abc.[00:20]我说我要一个大大大大耳机.[00:23]他觉得到小小的音机.[00:25]为什么要听妈妈的话.[00:28]长大后你就会开始懂得这段话.[00:30]长大后我开始明白.[00:33]为什么我跑得比别人快.[00:35]飞得比别人高.[00:36]将来大家看的都是我画的漫画.[00:38]大家唱的都是我写的歌.[00:41]妈妈的心她不让你看见.[00:43]温暖的事都在她心里面.[00:46]有空就得多摸摸她的手.[00:49]把手牵着一起梦游.[00:51]听妈妈的话别让她受伤.[01:00]想快快长大才能保护她.[01:10]美丽的白发幸福总发芽.[01:21]前世的魔法温暖中滋生.[01:32]在你的未来音乐是你的王牌.[01:34]那王牌谈的恋爱.[01:36]而我不想把你教坏.[01:37]还是听妈妈的话吧.[01:39]晚年再恋爱吧.[01:40]我知道你未来的路.[01:42]他们比我更清楚.[01:43]你用太多的学习工具才会写东写西.[01:46]但我建议最好听妈妈谈钢琴用功.[01:48]用功读书怎么会从我嘴巴说出.[01:50]不是你叔叔要教你用功读书.[01:53]妈妈挑给你的毛病你要好好的收拾.[01:56]因为不知道是我要告诉她我还留着.[01:58]对了我会遇到我(周润发).[02:00]所以你对跟同学炫耀都是为了学你爸爸.[02:03]说这么多写的清楚.[02:05]希望不要承认因为我了解你会站上流动街道.[02:09]你很是会唱流行歌.[02:11]因为张学友开始准备唱吻别.[02:13]听妈妈的话别让她受伤.[02:23]想快快长大才能保护她.[02:33]美丽的白发幸福总发芽.[02:43]前世的魔法温暖中滋生.[02:54]听妈妈的话别让她受伤.[03:05]想快快长大才能保护她.[03:15]长大后我开始明白为什么我.[03:19]跑得比别人快飞得比别人高.[03:21]将来大家看的都是我画的漫画.[03:23]大家唱的都是我写的歌.[03:26]妈妈的心她不让你看见.[03:29]温暖的事都在她心里面.[03:31]有空就得多摸摸她的手.[03:34]把手牵着一起梦游.[03:36]听妈妈的话别让她受伤.[03:45]想快快长大才能保护她.[03:56]美丽的白发幸福总发芽.[04:07]前世的魔法温暖中滋生."
		}else{
			if (s == "夜曲"){
				ly="[03:42][01:52][00:00].[02:00][00:07]欢迎您.[00:16]music.[00:11]词:方文山曲:周杰伦.[03:20][00:24]一群嗜血的蚂蚁被腐肉所吸引.[03:23][00:27]我面无表情看孤独的风景.[03:26][00:30]失去你爱恨开始分明.[03:29][00:32]失去你还有什麼事好关心.[03:32][00:35]当鸽子不再象徵和平.[03:34][00:37]我终于被提醒.[03:35][00:39]广场上喂食的是秃鹰.[03:37][00:41]我用漂亮的押韵.[03:38][00:42]形容被掠夺一空的爱情.[00:45]啊乌云开始遮蔽夜色不干净.[00:49]公园里葬礼的回音在漫天飞行.[00:51]送你的白色玫瑰.[00:53]在纯黑的环境凋零.[00:55]乌鸦在树枝上诡异的很安静.[00:57]静静听我黑色的大衣.[00:59]想温暖你日渐冰冷的回忆.[01:01]走过的走过的生命.[01:03]啊四周弥漫雾气.[01:04]我在空旷的墓地.[01:05]老去后还爱你.[01:08]为你弹奏萧邦的夜曲.[01:11]纪念我死去的爱情.[01:13]跟夜风一样的声音.[01:16]心碎的很好听.[01:19]手在键盘敲很轻.[01:22]我给的思念很小心.[01:25]你埋葬的地方叫幽冥.[01:29]为你弹奏萧邦的夜曲.[01:33]纪念我死去的爱情.[01:36]而我为你隐姓埋名.[01:39]在月光下弹琴.[01:41]对你心跳的感应.[01:44]还是如此温热亲近.[01:46]怀念你那鲜红的唇印.[02:13]那些断翅的蜻蜓散落在这森林.[02:17]而我的眼睛没有丝毫同情.[02:20]失去你泪水混浊不清.[02:22]失去你我连笑容都有阴影.[02:25]风在长满青苔的屋顶.[02:27]嘲笑我的伤心.[02:29]像一口没有水的枯井.[02:31]我用凄美的字型.[02:32]描绘后悔莫及的那爱情.[02:36]为你弹奏萧邦的夜曲.[02:39]纪念我死去的爱情.[02:42]跟夜风一样的声音.[02:44]心碎的很好听.[02:47]手在键盘敲很轻.[02:50]我给的思念很小心.[02:53]你埋葬的地方叫幽冥.[02:57]为你弹奏萧邦的夜曲.[03:01]纪念我死去的爱情.[03:04]而我为你隐姓埋名在月光下弹琴.[03:09]对你心跳的感应还是如此温热亲近.[03:15]怀念你那鲜红的唇印.[03:16].";
			}else{
				ly="[00:00] .[00:02]纯音乐暂无歌词"
			}
		}*/
		ly="[00:00] .[00:02]纯音乐暂无歌词"
	}	
 	return ly; 
} 
function show(t)//显示歌词 
{ 
	var div1=document.getElementById("lyr");//取得层
	document.getElementById("lyr").innerHTML=" ";//每次调用清空以前的一次 
	if(t<lytime[lytime.length-1])//先舍弃数组的最后一个
		{ 	
			for(var k=0;k<lytext.length;k++)
				{ 
	   			if(lytime[k]<=t&&t<lytime[k+1]) 
	   			{ scrollh=k*25;//让当前的滚动条的顶部改变一行的高度 
	   			div1.innerHTML+="<font color=#f60 style=font-weight:bold>"+lytext[k]+"</font><br>"; 
	   			} 
	   			else if(t<lytime[lytime.length-1])//数组的最后一个要舍弃
	   	 		div1.innerHTML+=lytext[k]+"<br>"; 
	 			} 
 		}
   else//加上数组的最后一个
      { 
         for(var j=0;j<lytext.length-1;j++) 
            div1.innerHTML+=lytext[j]+"<br>"; 
            div1.innerHTML+="<font color=red style=font-weight:bold>"+lytext[lytext.length-1]+"</font><br>"; 
      } 
} 
function scrollBar()//设置滚动条的滚动 
{ 
      if(document.getElementById("lyr").scrollTop<=scrollh) 
         document.getElementById("lyr").scrollTop+=1; 
      if(document.getElementById("lyr").scrollTop>=scrollh+50) 
         document.getElementById("lyr").scrollTop-=1; 
      window.setTimeout("scrollBar()",delay); 
} 
function getReady(s)//在显示歌词前做好准备工作 
{ 	
	var ly=getLy(s);//得到歌词
	if (ly=="") {
		$("#lry").html("本歌暂无歌词！");
	};
	var arrly=ly.split(".");//转化成数组
  	tflag=0;
  	for( var i=0;i<lytext.length;i++)
	{
		lytext[i]="";
	}
	for( var i=0;i<lytime.length;i++)
	{
		lytime[i]="";
	}
  	$("#lry").html(" ");
  	document.getElementById("lyr").scrollTop=0;
	for(var i=0;i<arrly.length;i++) 
  	sToArray(arrly[i]);
	sortAr();
	scrollBar(); 
}
function sToArray(str)//解析如“[02:02][00:24]"的字符串前放入数组
{  
   var left=0;//"["的个数
   var leftAr=new Array(); 
   for(var k=0;k<str.length;k++) 
   { 
      if(str.charAt(k)=="[") { leftAr[left]=k; left++; } 
   } 
   if(left!=0) 
   {
      for(var i=0;i<leftAr.length;i++) 
      {  
         lytext[tflag]=str.substring(str.lastIndexOf("]")+1);//放歌词 
         lytime[tflag]=conSeconds(str.substring(leftAr[i]+1,leftAr[i]+6));//放时间
         tflag++; 
      } 
   } 
 
} 
function sortAr()//按时间重新排序时间和歌词的数组 
{ 
	var temp=null; 
	var temp1=null; 
	for(var k=0;k<lytime.length;k++) { 
		for(var j=0;j<lytime.length-k;j++) {
			if(lytime[j]>lytime[j+1]) {
				temp=lytime[j];
				temp1=lytext[j];
				lytime[j]=lytime[j+1];
				lytext[j]=lytext[j+1];
				lytime[j+1]=temp; 
				lytext[j+1]=temp1;
				} 
			} 
		} 
} 
function conSeconds(t)//把形如：01：00的时间转化成秒；
{	
   var m=t.substring(0,t.indexOf(":")); 
   var s=t.substring(t.indexOf(":")+1); 
   m=parseInt(m.replace(/0/,""));
   var totalt=parseInt(m)*60+parseInt(s);   
   return totalt; 
} 
function mPlay()//开始播放
{ 
   var ms =audio.currentTime;
   show(ms); 
	window.setTimeout("mPlay()",100) 
}
function fPlay(){
	$(".start em[sonN="+songIndex+"]").click();
}
// 加载音乐文件,选择mp3播放文件,暂时不用了
function loadFile(input) {
    var file = input.files[0];
	if(file == undefined || file == null){
		return;
	}
	$("#audio").attr("src",file);
	$*("#audio").play();
    url = file.urn || file.name;
    ID3.loadTags(url, function() {
     showTags(url);
    }, {tags: ["title","artist","album","picture"],
		dataReader: ID3.FileAPIReader(file)
    });
}
// 加载歌曲详细信息
function showTags(url) {
    var tags = ID3.getAllTags(url);
    console.log(tags);
	var songName = "";
	var songer = "";
	var album = "";
	if(tags.title != undefined){
		songName = tags.title;
	}
	if(tags.artist != undefined){
		songer = tags.artist;
	}
	if(tags.album != undefined){
		album = tags.album
	}
	model.modelContent.push({
	 sonID : 4,
	 showID: ++count,
	 songName: songName,
	 songer: songer,
	 album: album
	});
      
	// 其他展示图片的方式（避免现在好多mp3文件没有专辑图片）
    /*
	var image = tags.picture;
	if (image) {
      var base64String = "";
      for (var i = 0; i < image.data.length; i++) {
          base64String += String.fromCharCode(image.data[i]);
      }
    var base64 = "data:" + image.format + ";base64," +window.btoa(base64String);
    document.getElementById('picture').setAttribute('src',base64);
    } else {
       document.getElementById('picture').style.display = "none";
    }*/
}
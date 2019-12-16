$(function(){
	/*$.getJSON("data/poetry.json",function(json){
		console.log(json);
	})*/
	
	/* start:监听键盘匹配诗词*/
	var outTimer;
	$("#input").prop('comStart', false);
	$("#input").bind({
		keyup:function(){//input propertychange 当输入框里的值有变化时执行此函数
			if ( !$("#input").prop("comStart") ){//判断状态，如果正在执行中文输入时，comStart此值为true=>下面代码不执行
				console.log("此时不是中文输入");
				show_poetry();
			}
		},
		compositionstart:function () {//在中文未输入完成时跳入此处,先不执行上面的事件处理
            $("#input").prop("comStart", true);
            console.log('中文输入：开始');
        },
        compositionend:function () {
            $("#input").prop("comStart", false);
            console.log('中文输入：结束');
            //show_poetry();
        }
	})
	
	function show_poetry(){//显示匹配的诗词
		var now_text = $("#input").val();
		var isbeing = false;//判断是否查询到
		$(".txt_wrap").html("");
		clearTimeout(outTimer);//清除之前的
		outTimer = setTimeout(function(){//0.8秒内未输入时，执行查找方法
			$.ajax({
				type:"get",
				url:"data/poetry.json",
				dataType:"json",
				success:function(data){
					if (now_text == "") return false;
					for (var i = 0; i < data.length; i++) {
						//循环查找输入的字符在诗词、标题以及作者姓名中是否存在
						if ( data[i].detail_text.indexOf(now_text)>-1 || data[i].title.indexOf(now_text)>-1 || data[i].detail_author.indexOf(now_text)>-1 || data[i].detail_dynasty.indexOf(now_text)>-1) {
							isbeing = true;//查询到输入的字符时将isbeng变为true
							var search = new RegExp(now_text,'g');//使用RegExp查找指定字符
							var detail_text = data[i].detail_text.replace(search,'<span>'+ now_text +'</span>');//替换诗词里查找的字符
							var title = data[i].title.replace(search,'<span>'+ now_text +'</span>');//替换诗词标题里查找的字符
							var detail_author = data[i].detail_author[0].replace(search,'<span>'+ now_text +'</span>');//替换作者名字中查找的字符
							var dynasty = data[i].detail_dynasty.replace(search,'<span>'+ now_text +'</span>');//替换朝代中查找的字符
							
							var verse = '<p class="verse">'+ detail_text +'</p>';//创建诗词主体标签
							var source = '<p class="source">《'+ title + '》' + detail_author + "(" + dynasty + ")" +'</p>';//标题·作者（朝代）
							var hinit = '<p class="hinit">'+ data[i].detail_translate_text +'</p>';//创一个隐藏的标签存储该诗词的译文和注释(为一个数组)
							var d_bg = '<p class="d_bg">'+ data[i].detail_background_text +'</p>';//创一个隐藏的标签存储该诗词的时代背景
							//console.log(data[i].detail_translate_text[0]);
							
							
							var txt = '<li class="txt">'+ verse + source + hinit + d_bg +'</li>';
							$(".txt_wrap").append(txt);//将匹配的这一首诗词添加到页面结构里
						}
					}
					if (!isbeing) {//没有查询到对应数据时
						$(".txt_wrap").html("未搜索到相应结果，请重试！");
						return false;
					}
					
					
				}
			});
		},800)
	}
	
	/* end:监听键盘匹配诗词*/
	
	
	
	/* start:点击诗词弹出此首诗词详细信息*/
	//直接调用click()方法 绑定不到事件。需要在.on里面添加我们需要绑定点击事件的选择器，不然绑定不了。也可以用.delegate（）方法。
	$(".txt_wrap").off("click").on("click","li",function(){
		
		var source = $(this).find(".source").text();//文本(例)：《行宫》元稹(唐代)  添加标题和作者朝代
		var tit = source.split("《")[1].split("》");//切割成数组：  ["行宫"，"元稹(唐代)"]
		var t_tit = '<p class="t_tit">'+ tit[0] +'</p>';//获取标题数据，创建标题标签
		
		tit = tit[1].split("(");//将字符串"元稹(唐代)"切割成：["元稹","唐代)"]
		var author = tit[0];
		var t_dynasty = tit[1].split(")")[0];//"唐代)" => ["唐代",""]
		var t_author = '<p class="t_author">'+ author +'<span class="t_dynasty">('+ t_dynasty +')</span></p>';//创建作者朝代标签
		
		$("#tankuang .tk_inner").append(t_tit + t_author);//添加标题和作者朝代文本
		
		var verse_data = $(this).find(".verse").text().split("。");//文本："寥落古行宫，宫花寂寞红。白头宫女在，闲坐说玄宗。" 根据句号切割，每一句创建一个p.t_detail标签
		for (var i=0;i<verse_data.length-1;i++) {//已转数组["寥落古行宫，宫花寂寞红","白头宫女在，闲坐说玄宗",""]
			var t_detail = '<p class="t_detail">'+ verse_data[i] +'。</p>';
			$("#tankuang .tk_inner").append(t_detail);
		}//添加诗词主题文本
		
		var hinit_title = '<p class="t_hint">译文及注释:</p>';
		$("#tankuang .tk_inner").append(hinit_title);
		var hinit_data = $(this).find(".hinit").text().split(",");//将诗词的译文和注释(此时为字符串)转换成数组
		$.each(hinit_data, function(item,value) {//item为数组的index值(0~length),value为遍历的值
			//console.log(item+"+"+value);
			var t_fy = '<p class="t_fy">'+ value +'</p>';
			$("#tankuang .tk_inner").append(t_fy);
		});//添加注释和译文内容文本
		
		var d_bg = $(this).find(".d_bg").text();
		var t_bg = '<p class="t_bg"><b>时代背景：</b>'+ d_bg +'</p>';
		$("#tankuang .tk_inner").append(t_bg);//添加时代背景文本
		
		$("#zhezhao").show();
		$("#tankuang").show();
		
		
		var window_h = $(window).height();
		var tk_h = $("#tankuang").height()+80;//获取插入了内容的弹框高度
		console.log(tk_h +","+window_h);
		if ( tk_h > window_h ) {//如果超出了当前窗口高度则将body页面滚动条禁用。
		}
		$(document.body).css({"overflow-y": "hidden"});
		$("#tankuang .tk_inner").css({"max-height":window_h-80-40});//再为弹框设置最大高度，使弹框里内容可以上下滚动浏览
		
		
	})
	
	
	$(".t_close").off("click").on("click",function(){//关闭弹框按钮
		$("#tankuang .tk_inner p").remove();//清除弹框内诗词内容
		$("#zhezhao").hide();
		$("#tankuang").hide();
		$(document.body).css({"overflow-y": "auto"});
	})
	/* end:点击诗词弹出此首诗词详细信息*/
})
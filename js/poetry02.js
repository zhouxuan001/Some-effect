let $input = $('#input'); // 输入框
let $txtList = $('.txt_wrap'); // 折叠列表
var outTimer;

// isChn 判断非中文
function isChn(str){
    var reg = /^[\u4E00-\u9FA5]+$/;
    if (!reg.test(str)){ // 不全是中文
		console.log('不全是中文');
        return false ;
    }else{ // 全是中文
		console.log('全是中文');
        return true ;
    }
}
// searchFn 搜索函数
let searchFn = function () {
	var old_text,now_text;
	var isbeing = false; // 判断是否查询到
	// input 绑定事件
	$input.on({
		keyup:function(){ // input propertychange 当输入框里的值有变化时执行此函数
			console.log('keyup');
			now_text = $input.val(); // 待查询文字
			$('.empty').hide();
			isbeing = false;
			// if ( now_text == old_text ) { // 跟上一次输入不变时,不执行
			// 	console.log('跟上一次输入不变时,不执行');
			// 	return false ;
			// }
			if ( now_text == '') { // 为空清空数据
				$txtList.height('0px').html('');
				return false ;
			}
			if ( now_text == ' ') { // 1.输入为空
				console.log('输入为空');
				$txtList.height('0px').html('');
				$('.empty').html('只能搜索中文1221字符，请检查输入是否正确!').show();
				return false ;
			}
			if ( !$input.prop('comStart') ){ // 2.判断状态，如果正在执行中文输入时，comStart此值为true=>下面代码不执行
				$txtList.height('0px').html('');
				if ( isChn($input.val()) ) { // 判断全是中文的情况下,才进行数据查询
					console.log('此时输入完毕');
					show_poetry(); // 请求数据
				}else{ // 判断非中文的情况,不进行数据查询
					$('.empty').html('只能搜索中文字符，请检查输入是否正确!').show();
				}
			}
		},
		compositionstart:function () { // 在中文未输入完成时跳入此处,先不执行其它的事件处理,此优先级高于其它
		    $input.prop('placeholder','') // 中文待输入时,将提示语清除,防止输入抖动
			$input.prop('comStart', true);
			console.log('中文输入：开始');
		},
		compositionend:function () {
			$input.prop('placeholder','请输入想要搜索的文字')
		    $input.prop('comStart', false);
		    console.log('中文输入：结束');
		    //show_poetry();
		}
	})
	// 显示匹配的诗词
	function show_poetry(){
		clearTimeout(outTimer); // 清除之前的
		outTimer = setTimeout(function(){//0.8秒内未输入时，执行查找方法
			$.ajax({
				type:'get',
				url:'data/data.json',
				dataType:'json',
				success:function (data) {
					if (now_text == '') return false;
					else {
						// title 标题
						// author 作者
						// content 内容
						// translation 译文
						// explanation 注释
						// appreciation 背景故事
						for (let i = 0; i < data.length; i++) {
							// indexOf() 方法返回小于0的数值代表不存在
							if(data[i].title.indexOf(now_text) < 0 && data[i].author.indexOf(now_text) < 0 && data[i].content.indexOf(now_text) < 0 ){
								// 遍历当前data[i]项数据未查询到此条信息时，结束，不执行接下来的代码。
								// 注意:break会跳出当前for循环，不会执行其它项的for循环。而 continue 只会跳出当前第i项，继续执行其它项
								continue;
							}
							isbeing = true;// 查询到对应数据将 isbeing 调为true，代表查询到对应数据
							// 查询到对应数据并添加到页面中
							// version 2.0：高亮显示匹配字符
							let searchTxt = new RegExp(now_text,'g');//使用RegExp查找指定字符 now_text
							// _content 诗词内容    _source 《标题》作者   _trans 注释   _hinit 及译文   _bg 背景时代故事
							let _content = '<div class="content">'+ data[i].content.replace(searchTxt,'<span>'+ now_text +'</span>') +'</div>';
							let _source = '<div class="source">'+ '《' + data[i].title.replace(searchTxt,'<span>'+ now_text +'</span>') + '》' + data[i].author.replace(searchTxt,'<span>'+ now_text +'</span>') +'</div>';
							let _trans = '<div class="trans">'+ data[i].translation +'</div>';
							let _hinit = '<div class="hinit">'+ data[i].explanation +'</div>';
							let _bg = '<div class="bg">'+ data[i].appreciation +'</div>';
							let _txtLi = '<li class="txt">' + _content + _source + _trans + _hinit + _bg + '</li>'
							$txtList.append(_txtLi)
						}
						old_text = $input.val();
						if (!isbeing) { // 没有查询到对应数据时
							$('.empty').html('未搜索到对应结果，请尝试输入其它文字!').show();
							return false;
						}
						let $txtList_height = $txtList.innerHeight();
						$txtList.height(0).show(); // 初始化 txtlist 高度,并显示该元素
						setTimeout(function(){ // 延时 执行动画效果
							$txtList.height($txtList.find('li').length*72 + 'px')
						},50)
						
						console.log(data.length,$txtList_height)
						// $txtList.slideDown(300); // 滑出搜索到的诗词列表
					}
				}
			});
		},800)
	}
}
// 弹窗函数
let $tk = $('#tankuang'); // 弹框
let $closeBtn = $('.tk_close .icon-close'); // 弹框关闭按钮
// 后期可以考虑使用 localStorage 存储诗词节点对象,提升性能.
let dialogFn = function () {
	// 点击诗词列表,弹出诗词详情弹窗
	$txtList.on('dblclick','li',function () {
		let $poetry = $(this); // DOM元素转JQ对象 : $poetry 为JS DOM 对象.
		openDialog(event,$poetry);
	})
	// 关闭弹窗:点击关闭按钮,关闭诗词详情弹窗
	$closeBtn.on('click',closeDialog);
	function closeDialog () { // 关闭弹窗
		let $pos = $('.tankuang .tk').position();
		let $pos_lt = $pos.left + 600 + 'px' , $pos_top = $pos.top + 'px';
		$('.tk').css({
			width: '0px',
			height: '0px',
			left: $pos_lt,
			top: $pos_top,
			opacity: '0'
		});
		$('.zhezhao').css({opacity: '0',visibility: 'hidden'}).promise().done(function(){
			setTimeout(function(){ // 0.3s 执行完动画以后再隐藏弹窗
				// $('.tankuang .tk_inner').html('') // 清空内容
				$('.tankuang').css('display','none');
			},300)
		})
	}
	function openDialog (event,$poetry) { // 打开弹窗
		console.log($poetry)
		const source = $poetry.find('.source').html().split('《')[1].split('》');
		let tit = source[0]; // 标题
		let author = source[1]; // 作者
		let detail = $poetry.find('.content p').html(); // 诗词内容
		let fy = $poetry.find('.trans').html(); // 翻译
		let zs = $poetry.find('.hinit').html(); // 注释
		let bg = $poetry.find('.bg').html(); // 时代背景,诗词赏析
		// 填充获取到的诗词内容
		if ( $('.tankuang .tk_inner').html() !== '' ) { // 判断弹框内节点是否已经创建,已创建便不再重复创建节点
			$('.tankuang .tk_tit').html(tit);
			$('.tankuang .tk_author').html(author);
			$('.tankuang .tk_detail').html(detail);
			$('.tankuang .tk_fy').html(fy);
			$('.tankuang .tk_zs').html(zs);
			$('.tankuang .tk_bg').html(bg);
		}else{
			tit = '<div class="tk_tit">' + tit + '</div>';
			author = '<div class="tk_author">' + author + '</div>';
			detail = '<div class="tk_detail">' + detail + '</div>';
			let hint1 = '<p class="tk_hint">译文及注释:</p>';
			let tip1 = '<p class="tk_tip">译文</p>';
			fy = '<div class="tk_fy">' + fy + '</div>';
			let tip2 = '<p class="tk_tip">注释</p>';
			zs = '<div class="tk_zs">' + zs + '</div>';
			let hint2 = '<p class="tk_hint">诗词赏析：</p>';
			bg = '<div class="tk_bg">' + bg + '</div>';
			$('.tankuang .tk_inner').append(tit + author + detail + hint1 + tip1 + fy + tip2 + zs + hint2 + bg );
		}
		
		// 显示弹窗
		$('.tankuang').css('display','block');
		// 根据鼠标点击位置定位弹窗初始位置
		let e = event || window.event;
		let $mouse_lt = e.clientX, $mouse_top = e.clientY;
		$('.tk').css({
			width: '0px',
			height: '0px',
			left: $mouse_lt,
			top: $mouse_top,
			transform: 'translateX(0%) translateY(0%)'
		});
		
		// 赋予弹窗宽度和高度,不然弹窗关闭动画效果不执行.
		let $tk_width = $('.tk').width(),$tk_height = $('.tk_inner').height() + 60;
		// 渲染节点,
		$('.zhezhao').css({opacity: '1',visibility: 'visible'});
		$('.tk').css({
			opacity: '1',
			width: '600px',
			height: $tk_height + 'px',
			left: '50%',
			top: '50%',
			transform: 'translateX(-50%) translateY(-50%)'
		});
		
		
	}
}

// 页面预加载执行函数
window.onload = function () {
	searchFn();
	dialogFn();
}
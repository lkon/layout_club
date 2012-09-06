/**
 * @fileOverview Этот сценарий уточняет список файлов изображений на сервере
 * затем загружает их попеременно в два элемента списка, чтобы получился эффект растворения.
 * @author <a href="http://elkonina.ru/">Yelena Konina</a>.
 */
(function () {
	/**
	 * утилитарная функция, выполняет вставку элемента декора в DOM, 
	 * с фоновым изображением силуэтов танцующих людей.
	 * @type {Function}
	 */
var fakeGenBeforeIE7 = function() {
		if (/ie7/.test(document.documentElement.className)) {
			$('<div>', { 'class' : 'slideshow_before'}).prependTo($('.slideshow'))
		}
	},
	/**
	 * Функция делает запрос на сервер методом HEAD
	 * для удостоверения, что искомый файл на сервере существует.
	 * @type {Function}
	 * @param {Function(array) : string} source - вызов возвращает адрес изображения
	 * @return {(String | Boolean)} (cntSrc|false) - если изображение существует, возвращается его адрес,
	 * в противном случае false
	 */
	testImgIsExists = function (source){	
		if (source && typeof source === 'function') {
				/**
				 * адрес текущего изображения
				 * @type {String} 
				 */
			var cntSrc = location.href.replace(/(.+\/)(?:.+\.html)/,'$1') + 'i/party/' + source(),
				/**
				 * статус существования текущего изображения на сервере
				 * @type {Boolean}
				 */
				status = false;	
			/**
			 * HEAD-методом запрашивает у сервера, есть ли файл с таким адресом
			 * @param {Object} настройка объекта XHR
			 */
			$.ajax({
					url : cntSrc,
					type : 'HEAD',
					async : false,
					success : function(){return status = true;}
				});
			if (!status)
				return false;
			else return cntSrc;
		}
	},	
	/**
	 * Продолжение работы слайдшоу: определяется текущий элемент списка,
	 * в который будет загружено очередное изображение - класса show или первый элемент списка,
	 * а также следующий элемент, всегда другой - не show. Для следующего назначается анимация прозрачности 
	 * до 1 и назначается класс show, а для текущего элемента - 0 и удаляется класс show.
	 * @type {Function}
	 * @param {Function(array) : string} source - вызов возвращает адрес изображения
	 */
	slideshowContinue = function(source) {
		if (source && typeof source === 'function') {
			/**
			 * текущий элемент списка с проявленным изображением
			 * @type {jQuery.<(number|function),(Element|jbject)>}
			 */
			var current = $('.slideshow .show') || $('.slideshow li:first'),
			/**
			 * следующий элемент списка с полностью прозрачным изображением
			 * @type {jQuery.<(number|function),(Element|jbject)>}
			 */
				next = ((current.next().length) ? ((current.next().hasClass('show')) ? $('.slideshow li:first') : current.next()) : $('.slideshow li:first'));
			/**
			 * дочернее изображение следующего элемента списка,
			 * определяется в результате цепочки исполняемых комманд
			 * в стиле jQuery
			 * @type {Element} 
			 */					
			var cntImg = next.css({opacity: 0})
							.addClass('show')
							.animate({opacity: 1}, 2000)
							.find('img')[0],
			/**
			 * адрес следующего изображения, вычисленный функцией src() и 
			 * проверенный testImgIsExists().
			 * @type {(String|Boolean)}
			 */				
				nextImg = testImgIsExists(source);
			if(nextImg){
				cntImg.src = nextImg;
			} 	 
			current.animate({opacity: 0}, 2000)
					.removeClass('show')
		}
	},
	/**
	 * Начало работы слайдшоу: оба элемента списка делаем прозрачными,
	 * затем первый элемент с дочерним изображением проявляется.
	 * Проверяется существование на сервере следующего изображения (получается рандомно),
	 * если оно есть - загружается в этот элемент.
	 * Через 5сек. вызывается функция продолжения слайдшоу.
	 * @type {Function}
	 * @param {Function(array) : string} source - вызов возвращает адрес изображения
	 */
	slideshowBegin = function (source) {
		if (source && typeof source === 'function') {
			$('.slideshow li').css({opacity: 0});
			var cntImg = $('.slideshow li:first').css({opacity: 1}).find('img')[0],
				nextImg = testImgIsExists(source);
			if(nextImg){
				cntImg.src = nextImg;
			} 
			setInterval(function () {
							slideshowContinue(source)
						}, 5000);
			fakeGenBeforeIE7();
		}
	},
	/**
	 * @author <a href=" http://stevesouders.com/efws/script-onload.php">Стив Соудерс</a>
	 * @type {Function}
	 * @param {String} src - адрес скрипта, который должен быть загружен
	 * @param {Function} callback - функция будет вызвана после успешной загрузки внешнего скрипта
	 * @param {Element} appendTo - html-элемент, куда будет загружен внешний скрипт, default: head.
	 */
	loadingScriptOut = function (src, callback, appendTo) {
		/**
		 * сценарий, загружаемый на страницу из внешнего источника
		 * @type {Element} 
		 */
		var script = document.createElement('script');
		if (script.readyState && !script.onload) {
			script.onreadystatechange = function () {
				if ( (script.readyState === "loaded" || script.readyState === "complete") && !script.onloadDone) {
					script.onloadDone = true;
					callback();
				}
			}
		} else {
			script.onload = function () {
				if (!script.onloadDone) {
					script.onloadDone = true;
					callback();
				}
			}
		}
		script.type = 'text/javascript';
		script.src = src;
		if (!appendTo) {
			appendTo = document.documentElement.children[0];
		}
		appendTo.appendChild(script);
	},
	/**
	 * Инициализирует работу слайдшоу.
	 * @type {Function}
	 */
	init = function (){
		/**
		 * @module
		 */
		var $ = jQuery,
		/**
		 * вызов функции возвращает следующий адрес изображения
		 * @function
		 * @public
		 */
			src;
		/**
		 * GET-методом запрос к серверу
		 * @memberOf jQuery
		 * @param {String} адрес сервера
		 * @param {Function(string)} обрабатывает ответ сервера
		 */
		$.get( "js/getimg.php",
			/** 
			 * @inner
			 * @param {String} resp - текстовый ответ с сервера
			 */
			function(resp){		
				/**
				 * строка ответа, разбитая по переносу строки
				 * @type {Array.<string>} 
				 */
				var a = encodeURIComponent(resp).split(/\%0A/),
					i = a.length;
				while ( i--) {
					if (a[i].length === 0)
						a.splice(i,1);
				}
				/**
				 * функция инкапсулирует в своем теле значение адреса изображения, которое будет начинать слайдшоу и
				 * возвращает новую функцию, вызов которой всегда будет возвращать адрес следующего изображения слайдшоу.	
				 * @function
				 * @inner
				 * @param {Array.<string>} files - массив имен файлов изображений
				 * @return {Function} src - новая функция, возвращающая при вызове адрес файла изображения 
				 */
				src =  (function(){	
							if(arguments[0].length !== 0){
								/**
								 * массив имен файлов изображений
								 * @type {Array.<string>}
								 */
								var files =  arguments[0],
									max = files.length,
									/**
									 * случайное число, будет выступать счетчиком, инкапсулируемом в теле функции
									 * @type {Number}
									 */
									count = Math.round(Math.random()*10); 
									/**
									 * новая функция, параметры которой в замыкании
									 * @return {String} files[count] элемент массива с адресом файла изображения
									 */
								return function(){
								        if (count < (max - 1) ) count += 1;
								        else count = 0;
									    return files[count];
								};
							}
						}(a)); 
				 if (src) {
			    	slideshowBegin(src);	
			    }	
		    });  					    
	};
	
window.onload = function(){
	loadingScriptOut("https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js", init, document.body);	
};	
}())



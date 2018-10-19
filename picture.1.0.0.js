// 依赖 hammer.js
// 依赖 exif.js

//图片编辑本体
;(function(window, document) {
	var body = document.body;

	/**
	 * settings {
	 * 	id: element, 上传按钮元素 非#id
	 * 	size: [300,  150], 剪裁尺寸
	 * 	onInit: function () {}, 钩子函数
	 * 	onLoadDataStart: function() {} 钩子函数 读取图片开始
	 * 	onLoadDataEnd: function() {} 钩子函数 读取图片结束
	 * 	onShow: function () {}, 钩子函数
	 * 	onCancle: function () {}, 钩子函数
	 * 	onConfirm: function (imgURL, imgBlob) {} 钩子函数 确定剪裁
	 * 	onClose: function () {}, 钩子函数 todo
	 * 	onDestroy; function() {} todo
	 * }
	 */

	function ImgEdit(settings) {
		this.settings = settings;
		this.view = new ImgEditView(settings);
		return this.init();
	}

	ImgEdit.prototype.init = function() {
		var that = this;
		var target = this.settings.id;
		var fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = "image/*";
		target.onclick = function() {
            fileInput.click();
        };

        // 读取图片
		var reader = new FileReader();
		var img = new Image();
		var imgDataURL;

		fileInput.onchange = function(e) {
			typeof that.settings.onLoadDataStart === "function" && that.settings.onLoadDataStart();
			reader.readAsDataURL(e.target.files[0]);
			fileInput.value = "";
		}

		reader.onload = function(e) {
			var _blob = dataURLtoBlob(reader.result);
			var _url = URL.createObjectURL(_blob);

			img.onload = function () {
				URL.revokeObjectURL(_url);
				EXIF.getData(_blob, function() {
					var orentation = EXIF.getTag(this, 'Orientation');
                    switch(orentation) {
                        case 6:
                            imgDataURL = rotateImage(img, 90);
                            break;
                        case 3:
                            imgDataURL = rotateImage(img, 180);
                            break;
                        case 8:
                            imgDataURL = rotateImage(img, 270);
                            break;
                        default:
                            imgDataURL = rotateImage(img, 0);
                            break; 
                    }
					_blob = dataURLtoBlob(imgDataURL);

					_url = URL.createObjectURL(_blob);

					that.view.show(_url);

					typeof that.settings.onLoadDataEnd === "function" && that.settings.onLoadDataEnd();
				});
			}
            img.src = _url;
		}
		typeof this.settings.onInit === "function" &&  this.settings.onInit();

		return this;
	}

	//视图部分
	function ImgEditView(settings) {
		this.settings = settings;
		this.imgEdit = document.createElement("div");
		this.imgEditHd = document.createElement("div");
		this.imgEditCancle = document.createElement("span");
		this.imgEditConfirm = document.createElement("span");

		this.imgEditBd = document.createElement("div");

		//背景画布
		this.canvasMask = document.createElement("canvas");
		this.maskCtx = this.canvasMask.getContext("2d");

		this.imgEditZoom = document.createElement("div");
		this.imgEditImg = document.createElement("img");

		this.imgEditFt = document.createElement("div");
		this.imgEditRotate = document.createElement("span");

		this.imgEditPreview = document.createElement("div");
		this.imgEditPreviewHd = document.createElement("div");
		this.imgEditPreviewCancle = document.createElement("span");
		this.imgEditPreviewConfirm = document.createElement("span");
		this.imgEditPreviewImg = document.createElement("img");

		// 隐藏画布
		this.canvas;
		this.ctx;
		this.canvasW = 0;
		this.canvasH = 0;

		//导出预览画布
		this.preCanvas = document.createElement("canvas");
		this.preCtx = this.preCanvas.getContext("2d");

		//图片的位移
		this.translateX = 0;
		this.translateY = 0;

		//旋转方向
		// 0: 0|360度  1: 90度  2: 180度 3： 270 度
		this.rotateDirection = 0; 

		this.scaleValue = 1; // 初始缩放系数

		this.scaleMax = 1; // todo 缩放最大值
		this.scaleMin = 0; // todo 缩放最小值
		this.scaleStep = 0.5; // todo 固定倍数缩小

		//图片与剪辑框 框的 比率
		this.ratio = 1;

		this.init();
		return this;
	}

	ImgEditView.prototype.init = function () {
		this.draw();
		this.bindEvents();
	}

	ImgEditView.prototype.draw = function() {
		this.imgEdit.className = "img-edit";
		
		this.imgEditHd.className = "img-edit__hd";
		this.imgEditCancle.className = "img-edit__cancle";
		this.imgEditCancle.innerText = "取消";
		this.imgEditConfirm.className = "img-edit__confirm";
		this.imgEditConfirm.innerText = "选取";

		this.imgEditBd.className = "img-edit__bd";
		this.canvasMask.className = "img-edit__mask";
		this.imgEditZoom.className = "img-edit__zoom";
		this.imgEditImg.className = "img-edit__img";

		this.imgEditFt.className = "img-edit__ft";
		this.imgEditRotate.className = "img-edit__rotate";
		this.imgEditRotate.innerText = "旋转";

		//预览部分 todo start
		this.imgEditPreview.className = "img-edit__preview";
		this.imgEditPreviewHd.className = "img-edit__preview-hd";
		this.imgEditPreviewCancle.className = "img-edit__preview-cancle";
		this.imgEditPreviewCancle.innerText = "放弃编辑";
		this.imgEditPreviewConfirm.className = "img-edit__preview-confirm";
		this.imgEditPreviewCancle.innerText = "确定编辑";
		this.imgEditPreviewImg.className = "img-edit__preview-img";

		this.imgEditPreviewHd.appendChild(this.imgEditPreviewCancle);
		this.imgEditPreviewHd.appendChild(this.imgEditPreviewConfirm);
		this.imgEditPreview.appendChild(this.imgEditPreviewHd);
		this.imgEditPreview.appendChild(this.imgEditPreviewImg);
		//预览部分 todo end

		this.imgEditHd.appendChild(this.imgEditCancle);
		this.imgEditHd.appendChild(this.imgEditConfirm);

		this.imgEditBd.appendChild(this.canvasMask);
		this.imgEditBd.appendChild(this.imgEditZoom);
		this.imgEditBd.appendChild(this.imgEditImg);

		this.imgEditFt.appendChild(this.imgEditRotate);

		this.imgEdit.appendChild(this.imgEditHd);
		this.imgEdit.appendChild(this.imgEditBd);
		this.imgEdit.appendChild(this.imgEditFt);

		body.appendChild(this.imgEdit);
		var maskBound = this.canvasMask.getBoundingClientRect();
		this.canvasMask.width = maskBound.width;
		this.canvasMask.height = maskBound.height;
		this.imgEdit.style.display = "none";

		this.settings.size = this.settings.size || [this.canvasMask.width, 200];

		if (this.settings.size[0] > screen.width) {
			var _r = screen.width / this.settings.size[0];
			this.settings.size[0] = screen.width;
			this.settings.size[1] = this.settings.size[1] * _r;
		}
		var _size = this.settings.size;
		
		//背景蒙层 合成
		this.maskCtx.globalAlpha = 0.85;
		this.maskCtx.save();
		this.maskCtx.fillRect(0, 0, this.canvasMask.width, this.canvasMask.height);
		this.maskCtx.fillStyle = "rgba(0, 0, 0, .3)";
		this.maskCtx.restore();
		
		this.maskCtx.globalCompositeOperation = "destination-out";

		this.maskCtx.save();
		this.maskCtx.fillRect((this.canvasMask.width - _size[0]) / 2, (this.canvasMask.height - _size[1]) / 2, _size[0], _size[1]);
		this.maskCtx.fillStyle = "rgba(255, 255, 255, 0)";
		this.maskCtx.restore();		

		//手指操作蒙层 定位在 剪裁窗口上
		this.imgEditZoom.style.width = _size[0] + "px";
		this.imgEditZoom.style.height = _size[1] + "px";
		this.imgEditZoom.style.top = 0;
		this.imgEditZoom.style.top = (this.canvasMask.height - _size[1]) / 2 + "px";
		this.imgEditZoom.style.left = (this.canvasMask.width - _size[0]) / 2 + "px";
	}

	ImgEditView.prototype.bindEvents = function() {
		var that = this;
		var imgEditImg = this.imgEditImg;
		var imgEditImgStyle = imgEditImg.style;
		var settings = that.settings;
		var size = settings.size;
		var _scaleValue;
		var _translateX;
		var _translateY;
		
		//手势
		var hammerTime = new Hammer(this.imgEditZoom);

		//缩放 
		hammerTime.get("pinch").set({enable: true});
		hammerTime.on("pinchmove", function(e) {
			that.clearCanvas();

			that.ctx.save();	
			that.ctx.scale(e.scale, e.scale);
			that.ctx.drawImage(imgEditImg, -imgEditImg.width / 2, -imgEditImg.height / 2, imgEditImg.width, imgEditImg.height);
			that.ctx.restore();
			
			_scaleValue = that.scaleValue * e.scale;
			imgEditImgStyle.transform = "translate(" + that.translateX + "px, " + that.translateY + "px)" + "scale(" + _scaleValue +", " + _scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
			imgEditImgStyle.webkitTransform = "translate(" + that.translateX + "px, " + that.translateY + "px)" + "scale(" + _scaleValue +", " + _scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
		});

		hammerTime.on("pinchend", function(e) {
			that.scaleValue *= e.scale;
			that.ctx.scale(e.scale, e.scale);
		});

		//移动
		hammerTime.on("panmove", function(e) {
			that.clearCanvas();

			that.ctx.save();
			if (!that.rotateDirection) {
                that.ctx.translate(e.deltaX / that.scaleValue, e.deltaY / that.scaleValue);
            }
            if (that.rotateDirection == 1) {
                that.ctx.translate(e.deltaY / that.scaleValue, -e.deltaX / that.scaleValue);
            }
            if (that.rotateDirection == 2) {
                that.ctx.translate(-e.deltaX / that.scaleValue, -e.deltaY / that.scaleValue);
            }
            if (that.rotateDirection == 3) {
                that.ctx.translate(-e.deltaY / that.scaleValue, e.deltaX / that.scaleValue);
            }
			that.ctx.drawImage(imgEditImg, -imgEditImg.width / 2, -imgEditImg.height / 2, imgEditImg.width, imgEditImg.height);
			that.ctx.restore();

			_translateX = that.translateX + e.deltaX;
			_translateY = that.translateY + e.deltaY;

			imgEditImgStyle.transform = "translate(" + _translateX + "px, " + _translateY + "px)" + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
			imgEditImgStyle.webkitTransform = "translate(" + _translateX + "px, " + _translateY + "px)" + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)"; 
		});

		hammerTime.on("panend", function(e) {
			that.translateX += e.deltaX;
			that.translateY += e.deltaY;

            if (!that.rotateDirection) {
                that.ctx.translate(e.deltaX / that.scaleValue, e.deltaY / that.scaleValue);
            }
            if (that.rotateDirection == 1) {
                that.ctx.translate(e.deltaY / that.scaleValue, -e.deltaX / that.scaleValue);
            }
            if (that.rotateDirection == 2) {
                that.ctx.translate(-e.deltaX / that.scaleValue, -e.deltaY / that.scaleValue);
            }
            if (that.rotateDirection == 3) {
                that.ctx.translate(-e.deltaY / that.scaleValue, e.deltaX / that.scaleValue);
            }
		});

		//旋转
		this.imgEditRotate.onclick = function() {
			that.clearCanvas();
			that.ctx.rotate(90 * Math.PI / 180);
			that.ctx.drawImage(imgEditImg, -imgEditImg.width / 2, -imgEditImg.height / 2, imgEditImg.width, imgEditImg.height);

			that.rotateDirection++;
			that.rotateDirection %= 4;
			imgEditImgStyle.transform = "translate(" + that.translateX + "px, " + that.translateY + "px)" + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
			imgEditImgStyle.webkitTransform = "translate(" + that.translateX + "px, " + that.translateY + "px)" + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
		}

		//取消
		this.imgEditCancle.onclick = function() {
			that.imgEdit.style.display = "none";
            that.canvas = null;
			typeof settings.onCancle === "function" && settings.onCancle();
		}

		//确定 
		this.imgEditConfirm.onclick = function() {
			var imgData = that.ctx.getImageData((that.canvasW - size[0]) / 2, (that.canvasH - size[1]) / 2, size[0], size[1]);
			that.preCtx.putImageData(imgData, 0, 0);

			imgData = that.preCanvas.toDataURL("image/png", 1);
			typeof settings.onConfirm === "function" && settings.onConfirm(imgData, dataURLtoBlob(imgData));
			that.imgEdit.style.display = "none";
		}
	}

	ImgEditView.prototype.show = function(imgSource) {
		var that = this;
		
		//剪裁尺寸
		var _size = this.settings.size;

		//新建隐藏画布 和 新的画布上下文 并初始化
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.canvasW = this.canvas.width = this.canvasMask.width;
		this.canvasH = this.canvas.height = this.canvasMask.height;

		//导出预览画布尺寸初始化
		this.preCanvas.width = _size[0];
		this.preCanvas.height = _size[1];

		//图片的位移 初始化
		this.translateX = 0;
		this.translateY = 0;

		// 旋转方向 初始化
		// 0: 0|360度  1: 90度  2: 180度 3： 270 度
		this.rotateDirection = 0; 

		// 用户缩放系数 初始化
		this.scaleValue = 1;

        // 操作替身图片 初始化
        this.imgEditImg.style.transform = "translate(" + that.translateX + "px, " + that.translateY + "px)"  + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
        this.imgEditImg.style.webkitTransform = "translate(" + that.translateX + "px, " + that.translateY + "px)"  + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
        
		this.imgEditImg.onload = function() {

			//图源载入后打开编辑层  
			that.imgEdit.style.display = "block";

			that.ratio = that.canvasW / this.width;

			//隐藏编辑画布
			that.ctx.translate(that.canvasW / 2, that.canvasH / 2);
			that.ctx.scale(that.ratio, that.ratio);
			that.ctx.drawImage(this, -this.width / 2, -this.height / 2, this.width, this.height);

			//替身图片
			that.translateX = -(this.width - that.canvasW) / 2;
			that.translateY = -(this.height - that.canvasH) / 2;
			that.scaleValue *= that.ratio;
			this.style.transform = "translate(" + that.translateX + "px, " + that.translateY + "px)"  + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
			this.style.webkitTransform = "translate(" + that.translateX + "px, " + that.translateY + "px)"  + "scale(" + that.scaleValue +", " + that.scaleValue +")" + "rotate(" + that.rotateDirection * 90 +"deg)";
		}

        //操作替身图片
        this.imgEditImg.src = imgSource;
	}

	ImgEditView.prototype.clearCanvas = function() {
		this.ctx.save();
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.restore();
	}

	window.ImgEdit = ImgEdit;

	//ios img 与 canvas显示方向不同 需要提前旋转
	function rotateImage(img, degree) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        // var encoder = new JPEGEncoder();
        var ratio = 1;
        var w = img.width;
        var h = img.height;
        var pxRatio = window.devicePixelRatio;
        var theImgData;

        if (img.width > 1365 || img.height > 1365) {
            w = document.body.getBoundingClientRect().width;
            ratio = w / img.width;
            h = img.height * ratio;
        }

        if (!degree) {
            canvas = createHDPICanvas(canvas, w, h);
            ctx.scale(pxRatio, pxRatio);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
            ctx.restore();
        }

        if (degree == 90) {
            canvas = createHDPICanvas(canvas, h, w);
            ctx.scale(pxRatio, pxRatio);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.rotate(degree * Math.PI / 180);
            ctx.translate(0, -img.height * ratio);
            ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
            ctx.restore();
        }

        if (degree == 180) {
            canvas = createHDPICanvas(canvas, w, h);
            ctx.scale(pxRatio, pxRatio);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.rotate(degree * Math.PI / 180);
            ctx.translate(-img.width * ratio, -img.height * ratio);
            ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
            ctx.restore();
        }

        if (degree == 270) {
            canvas = createHDPICanvas(canvas, h, w);
            ctx.scale(pxRatio, pxRatio);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.translate(-img.height * ratio, 0);
            ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
            ctx.restore();
        }

        var imgDataURL = canvas.toDataURL("image/jepg", 0.8);
        return imgDataURL;
    }

	//base64转二进制
	function dataURLtoBlob(dataurl) {
	 	var arr = dataurl.split(',');
		var mime = arr[0].match(/:(.*?);/)[1];
	    var bstr = atob(arr[1]);
	    var n = bstr.length;
	    var u8arr = new Uint8Array(n);
	    while (n--) {
	        u8arr[n] = bstr.charCodeAt(n);
	    }
	    return new Blob([u8arr], {type: mime});
	}

	//在视网膜屏幕下 canvas 需放大 解决 图片模糊的问题
    function createHDPICanvas(canvas, width, height) {
        var ratio = window.devicePixelRatio;
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        return canvas;
    }

})(window, document);




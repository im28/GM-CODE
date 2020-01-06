function isIntersect(point, circle) {
	return Math.sqrt((point.x-circle.x) ** 2 + (point.y - circle.y) ** 2) < 3;
}
function switch_on(point_arr,pos) {
	let i=-1;
	point_arr.forEach((apoint,index,arr)=>{
		point_arr[index].isClicked = false;
		if (isIntersect(pos, apoint)) {
			point_arr[index].isClicked = true;
			i = index;
		}
	});
	return i;
}
window.onload = function() {
	
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		width = canvas.width = window.innerWidth,
		height = canvas.height = window.innerHeight,
		p0 = {
			x: Math.random() * width,
			y: Math.random() * height,
			isClicked:false
		},
		p1 = {
			x: Math.random() * width,
			y: Math.random() * height,
			isClicked:false
		},
		p2 = {
			x: Math.random() * width,
			y: Math.random() * height,
			isClicked:false
		},
		cp = {},
		move=false,
		index,
		moving_pos={};

	let point_arr =[p0,p1,p2];

	canvas.addEventListener("mousemove", setMousePosition, false);
		function setMousePosition(e) {
		moving_pos.x = e.clientX;
		moving_pos.y  = e.clientY;
	}
	canvas.addEventListener('click', (e) => {
		move = !move;
		pos = {
			x: e.clientX,
			y: e.clientY
		};
		index = switch_on(point_arr,pos);
		point_arr.forEach(point=>console.log(point));
	});
	
	function drawPoint(p) {
		context.beginPath();
		context.arc(p.x, p.y, 3, 0, Math.PI * 2, false);
		context.fill();
	}
	function erraseCanvas() {
        canvas.width+=0;
    }
	function drawScreen () {
		erraseCanvas();
		if(index!=-1&&move) {
			console.log(index);
			point_arr[index].x = moving_pos.x;
			point_arr[index].y = moving_pos.y;
		}
		cp.x = p1.x * 2 - (p0.x + p2.x) / 2;
		cp.y = p1.y * 2 - (p0.y + p2.y) / 2;

		drawPoint(p0);
		drawPoint(p1);
		drawPoint(p2);
		drawPoint(cp);
		
		context.strokeStyle = "lightgray";
		context.beginPath();
		context.moveTo(p0.x, p0.y);
		context.lineTo(cp.x, cp.y);
		context.lineTo(p2.x, p2.y);
		context.stroke();
	
		context.strokeStyle = "black";
		context.beginPath();
		context.moveTo(p0.x, p0.y);
		context.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
		context.stroke();
    }
	function Loop() {
		window.setTimeout(Loop, 5);
		drawScreen()   
   	}

   	Loop();
};
